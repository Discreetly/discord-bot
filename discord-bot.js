import { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle, ModalBuilder, ActivityType, PermissionsBitField } from 'discord.js';
import { faker } from '@faker-js/faker';

import axios from 'axios';
import 'dotenv/config';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages]
});

const TOKEN = process.env.DISCORDTOKEN

client.once('ready', () => {
  console.log('Bot is ready!');
  client.user.setPresence({ activities: [{ name: '/help to get started', type: ActivityType.Watching }], status: 'online' })
  client.guilds.cache.forEach(guild => {
    guild.commands.create({
      name: 'goanon',
      description: 'Receive invite code for discreetly rooms'
    })
    .then(command => console.log(`Created command ${command.name}`))
    .catch(console.error);

    guild.commands.create({
      name: 'addroletoroom',
      description: 'Add Discreetly Rooms to your discord server'
    })
    .then(command => console.log(`Created command ${command.name}`))
    .catch(console.error);

    guild.commands.create({
      name: 'help',
      description: 'Get help with Discreetly Bot commands'
    }).then(command => console.log(`Created command ${command.name}`))
    .catch(console.error);

    guild.commands.create({
      name: 'createroom',
      description: 'Create a Discreetly room for a given discord role',
      options: [
        {
          name: 'roomname',
          description: 'Name of the room',
          type: 3,
        }
      ]
    })
    .then(command => console.log(`Created command ${command.name}`))
    .catch(console.error);
  });

  client.on('guildCreate', async (guild) => {
    const discordId = guild.id;
    try {
      await axios.post(`${process.env.SERVERURL}/gateway/discord/addguild`, {
        guildId: discordId
        }, {
          headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.USERNAME}:${process.env.PASSWORD}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });
    }
    catch {
      console.log('Error adding guild to database');
    }
    guild.commands.create({
      name: 'goanon',
      description: 'Receive invite code for discreetly rooms'
    })
    .then(command => console.log(`Created command ${command.name}`))
    .catch(console.error);

    guild.commands.create({
      name: 'addroletoroom',
      description: 'Add Discreetly Rooms to your discord server'
    })
    .then(command => console.log(`Created command ${command.name}`))
    .catch(console.error);

    guild.commands.create({
      name: 'help',
      description: 'Get help with Discreetly Bot commands'
    })
    .then(command => console.log(`Created command ${command.name}`))
    .catch(console.error);

    guild.commands.create({
      name: 'createroom',
      description: 'Create a Discreetly room for a given discord role',
      options: [
        {
          name: 'roomname',
          description: 'Name of the room',
          type: 3,
        }
      ]
    })
    .then(command => console.log(`Created command ${command.name}`))
    .catch(console.error);
  })

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;
    if (commandName === 'help') {
      if (interaction.member.permissionsIn(interaction.channel).has(PermissionsBitField.Flags.Administrator)) {
        await interaction.reply({ content:
          "# **[Discreetly](https://app.discreetly.chat)** \n ## ***Admins*** \n - Admins **MUST** create a room first or be in a previous Discreetly discord room \n `/createroom roomname` (roomname is optional) - If you don't provide a roomname, your rooms name will be random \n - If you are already in Discreetly discord rooms and you want to add those rooms to your discord server use `/addroletoroom` \n - Users can request codes to join the rooms associated with this discord server using `/goanon` \n" , ephemeral: true })
      } else {
        await interaction.reply({
          content: "# **[Discreetly](https://app.discreetly.chat)** \n ## ***Users*** \n - Users can request codes to join the rooms associated with this discord server using `/goanon` \n", ephemeral: true }
        )
      }
    }

    if (commandName === 'createroom') {
      if (interaction.member.permissionsIn(interaction.channel).has(PermissionsBitField.Flags.Administrator)) {
        const roomCount = await axios.post(`${process.env.SERVERURL}/gateway/discord/checkrooms`, {
          discordId: interaction.guildId
        }, {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.DISCORD_USERNAME}:${process.env.DISCORD_PASSWORD}`).toString('base64')}`,
            'Content-Type': 'application/json'
          }
        }
        )
        if (roomCount.data.length <= 3) {

        const roles = interaction.guild.roles.cache.map(role => {
          return {
            label: role.name,
            value: `${role.name}: ${role.id}`
          }
        });
        let roomName;
        try {
          roomName = interaction.options.getString('roomname') ? interaction.options.getString('roomname') : faker.location.streetAddress();
        } catch {
          roomName = `Room_${Date.now()}`
        }


          const selectRole = new StringSelectMenuBuilder()
          .setCustomId('create-room')
          .setPlaceholder('Select Role')
          .setMinValues(1)
          .setMaxValues(roles.length)
          .addOptions(roles)
          const row2 = new ActionRowBuilder()
          .addComponents(selectRole)

          await interaction.reply({ content: `Select the role(s) allowed to join ${roomName}`, components: [row2], ephemeral: true });


        client.on('interactionCreate', async (interaction) => {
          if (interaction.customId === 'create-room') {

            const roleName = interaction.values[0].split(': ')[0];
            const roleIds = interaction.values.map(role => role.split(': ')[1]);

            const createdRoom = await axios.post(`${process.env.SERVERURL}/room/add`, {
              roomName: roomName,
              rateLimit: 100000,
              userMessageLimit: 12,
              numClaimCodes: 0,
              roomType: 'DISCORD',
              membershipType: 'IDENTITY_LIST',
            }, {
              headers: {
                'Authorization': `Basic ${Buffer.from(`${process.env.USERNAME}:${process.env.PASSWORD}`).toString('base64')}`,
                'Content-Type': 'application/json'
              }
            })
            const createdCode = await axios.post(`${process.env.SERVERURL}/admin/addcode`, {
              numCodes: 1,
              rooms: [createdRoom.data.roomId],
              all: false,
              expiresAt: 0,
              usesLeft: 2,
              discordId: interaction.user.id
            }, {
              headers: {
                'Authorization': `Basic ${Buffer.from(`${process.env.USERNAME}:${process.env.PASSWORD}`).toString('base64')}`,
                'Content-Type': 'application/json'
              }
            })
            console.log(createdCode.data.codes);
            await interaction.reply({ content: `Your code for ${roleName}: ${process.env.CLIENTURL}/signup/${createdCode.data.codes[0].claimcode}`, ephemeral: true });

            await axios.post(`${process.env.SERVERURL}/gateway/discord/addrole`, {
              roles: roleIds,
              roomId: createdRoom.data.roomId,
              guildId: interaction.guildId
            }, {
              headers: {
                'Authorization': `Basic ${Buffer.from(`${process.env.DISCORD_USERNAME}:${process.env.DISCORD_PASSWORD}`).toString('base64')}`,
                'Content-Type': 'application/json'
              }
            })
          }
        })
      } else {
        await interaction.reply({ content: 'You have reached the maximum number of rooms for your server', ephemeral: true });
      }
    } else {
      await interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
    }
    }

    if (commandName === 'addroletoroom') {
      if (interaction.member.permissionsIn(interaction.channel).has(PermissionsBitField.Flags.Administrator)) {
        const foundRooms = await axios.post(`${process.env.SERVERURL}/gateway/discord/rooms`, {
          discordUserId: interaction.user.id
        }, {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.DISCORD_USERNAME}:${process.env.DISCORD_PASSWORD}`).toString('base64')}`,
            'Content-Type': 'application/json'
          }
        }
       );
       const roomChoices = foundRooms.data.rooms.map(room => {
          return {
            label: room.name,
            value: `${room.name}: ${room.roomId}`
          }
       })
        if (roomChoices.length === 0) {
          await interaction.reply({ content: 'You are not in any Discreetly rooms', ephemeral: true });
        } else {
          const selectRoom = new StringSelectMenuBuilder()
          .setCustomId('rooms')
          .setPlaceholder('Select Room')
          .setMinValues(1)
          .setMaxValues(1)
          .addOptions(roomChoices)

          const rows = new ActionRowBuilder()
          .addComponents(selectRoom)

          await interaction.reply({ content: 'Select the rooms you want to add to your server', components: [rows], ephemeral: true });
        }

        client.on('interactionCreate', async (interaction) => {
          if (interaction.customId === 'rooms') {

            const roomId = interaction.values[0].split(': ')[1]

            const roomName = interaction.values[0].split(': ')[0]

            const roles = interaction.guild.roles.cache.map(role => {
              return {
                label: role.name,
                value: `${role.id}: ${roomId}`
              }
            });

            const selectRole = new StringSelectMenuBuilder()
            .setCustomId('roles')
            .setPlaceholder(`Select Roles for ${roomName}`)
            .setMinValues(1)
            .setMaxValues(roles.length)
            .addOptions(roles)

            const rows = new ActionRowBuilder()
            .addComponents(selectRole)

            await interaction.reply({ content: `Select the roles you want to be associated with ${roomName}`, components: [rows], ephemeral: true });

            client.on('interactionCreate', async (interaction) => {
              if (interaction.customId === 'roles') {
                console.log(interaction.values);
                console.log(interaction);

                const roleIds = interaction.values.map(role => role.split(': ')[0]);
                const roomId = interaction.values[0].split(': ')[1];
                await axios.post(`${process.env.SERVERURL}/gateway/discord/addrole`, {
                  roles: roleIds,
                  roomId: roomId,
                  guildId: interaction.guildId
                }, {
                  headers: {
                    'Authorization': `Basic ${Buffer.from(`${process.env.DISCORD_USERNAME}:${process.env.DISCORD_PASSWORD}`).toString('base64')}`,
                    'Content-Type': 'application/json'
                  }
                })
                await interaction.reply({ content: `Added ${roomName} to your server and users can now **/goanon** `, ephemeral: true });
              }
            })
          }
        })
      } else {
        await interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
      }
    }

    if (commandName === 'goanon') {

    const interactionMember = interaction.member;
    const roles = interactionMember.roles.cache.map(role => role.id);
    console.log(roles)
    let roomIdSet = new Set();
    let roomNames = '';

      try {
        const foundRooms = await axios.post(`${process.env.SERVERURL}/gateway/discord/getrooms`, {
          roles: roles,
          discordId: interaction.user.id
        }, {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.DISCORD_USERNAME}:${process.env.DISCORD_PASSWORD}`).toString('base64')}`,
            'Content-Type': 'application/json'
          }
        });
        foundRooms.data.rooms.forEach(room => {
          return roomIdSet.add(room);
        })
        foundRooms.data.roomNames.forEach((room, index) => {
          if (index === foundRooms.data.roomNames.length - 1) {
            roomNames += room;
          } else {
            roomNames += room + ', ';
          }
        })
      } catch (error) {
        console.error(error);
      }
    const roomIds = Array.from(roomIdSet);

    const claimCode = await axios.post(`${process.env.SERVERURL}/admin/addcode`, {
      numCodes: 1,
      rooms: roomIds,
      all: false,
      expiresAt: false,
      usesLeft: 1
    }, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.USERNAME}:${process.env.PASSWORD}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    })
    await interaction.reply({ content: `An invite code lets you join a discreetly room only once with your username. \n **Please don't share it!** \n \n Code(s) for: **${roomNames}** \n \n  Your invite link is ${process.env.CLIENTURL}/signup/${claimCode.data.codes[0].claimcode}`, ephemeral: true });
  }
  });
});


client.login(TOKEN);
