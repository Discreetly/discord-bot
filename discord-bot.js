import { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

import axios from 'axios';
import 'dotenv/config'

// TODO Move this into the Discreetly database and let it be queried with an API key/Password


const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages]
});

const TOKEN = process.env.DISCORDTOKEN


client.once('ready', () => {
  console.log('Bot is ready!');

  client.guilds.cache.forEach(guild => {
    guild.commands.create({
      name: 'requestcode',
      description: 'Receive invite code for discreetly rooms'
    })
    .then(command => console.log(`Created command ${command.name}`))
    .catch(console.error);

    guild.commands.create({
      name: 'addrooms',
      description: 'Add Discreetly Rooms to your discord server'
    })
    .then(command => console.log(`Created command ${command.name}`))
    .catch(console.error);

    guild.commands.create({
      name: 'help',
      description: 'Get help with Discreetly Bot commands'
    })
    guild.commands.create({
      name: 'addroom',
      description: 'Create a Discreetly room for a given discord role'
    })
    .then(command => console.log(`Created command ${command.name}`))
    .catch(console.error);
  });

  client.on('guildCreate', async (guild) => {
    const discordId = guild.id;

    try {
      await axios.post(`${process.env.SERVERURL}/api/discord/addguild`, {
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
      name: 'requestcode',
      description: 'Receive invite code for discreetly rooms'
    })
    .then(command => console.log(`Created command ${command.name}`))
    .catch(console.error);

    guild.commands.create({
      name: 'addrooms',
      description: 'Add Discreetly Rooms to your discord server'
    })
    .then(command => console.log(`Created command ${command.name}`))
    .catch(console.error);

    guild.commands.create({
      name: 'help',
      description: 'Get help with Discreetly Bot commands'
    })
    guild.commands.create({
      name: 'addroom',
      description: 'Create a Discreetly room for a given discord role'
    })
    .then(command => console.log(`Created command ${command.name}`))
    .catch(console.error);
  })

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'help') {
      await interaction.reply({ content: 'Admins can select rooms to to your server with ***/addrooms*** and users can request a code with ***/requestcode***', ephemeral: true });
    }

    if (commandName === 'addroom') {
      if (interaction.member.permissions.has('ADMINISTRATOR')) {
        const roles = interaction.guild.roles.cache.map(role => {
          return {
            label: role.name,
            value: role.name
          }
        });

        const selectRole = new StringSelectMenuBuilder()
        .setCustomId('create-room')
        .setPlaceholder('Select Role')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(roles)

        const rows = new ActionRowBuilder()
        .addComponents(selectRole)

        await interaction.reply({ content: 'Select the role you want to create a room for', components: [rows], ephemeral: true });

        client.on('interactionCreate', async (interaction) => {
          if (interaction.customId === 'create-room') {

            const roleName = interaction.values[0];

            const createdRoom = await axios.post(`${process.env.SERVERURL}/api/room/add`, {
              roomName: roleName,
              rateLimit: 10000,
              userMessageLimit: 10,
              numClaimCodes: 1,
              roomType: 'DISCORD',
              membershipType: 'PUBLIC',
              discordIds: [interaction.user.id]
            }, {
              headers: {
                'Authorization': `Basic ${Buffer.from(`${process.env.USERNAME}:${process.env.PASSWORD}`).toString('base64')}`,
                'Content-Type': 'application/json'
              }
            })
            console.log(createdRoom.data.claimCodes[0].claimcode);
            await interaction.reply({ content: `Your code for ${roleName}: ${process.env.SERVERURL}/join/${createdRoom.data.claimCodes[0].claimcode}`, ephemeral: true });
          }
        })
      } else {
        await interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
      }
    }

    if (commandName === 'addrooms') {
      if (interaction.member.permissions.has('ADMINISTRATOR')) {
        const foundRooms = await axios.post(`${process.env.SERVERURL}/api/discord/rooms`, {
          discordUserId: interaction.user.id
        }, {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.USERNAME}:${process.env.PASSWORD}`).toString('base64')}`,
            'Content-Type': 'application/json'
          }
        }
       );

       const roomChoices = foundRooms.data.map(room => {
          return {
            label: room.name,
            value: `${room.name}: ${room.roomId}`
          }
       })

        const selectRoom = new StringSelectMenuBuilder()
        .setCustomId('rooms')
        .setPlaceholder('Select Room')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(roomChoices)

        const rows = new ActionRowBuilder()
        .addComponents(selectRoom)


        await interaction.reply({ content: 'Select the rooms you want to add to your server', components: [rows], ephemeral: true });

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

                const roleIds = interaction.values.map(role => role.split(': ')[0]);
                const roomId = interaction.values[0].split(': ')[1];
                await axios.post(`${process.env.SERVERURL}/api/discord/addrole`, {
                  roles: roleIds,
                  roomId: roomId,
                  guildId: interaction.guildId
                }, {
                  headers: {
                    'Authorization': `Basic ${Buffer.from(`${process.env.USERNAME}:${process.env.PASSWORD}`).toString('base64')}`,
                    'Content-Type': 'application/json'
                  }
                })
                await interaction.reply({ content: `Added ${roomName} to your server`, ephemeral: true });
              }
            })
          }
        })
      } else {
        await interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
      }
    }

    if (commandName === 'requestcode') {
    const discordServer = interaction.guildId;


    const member = interaction.user.id;
    const interactionMember = interaction.member;
    const roles = interactionMember.roles.cache.map(role => role.id);
    let roomIdSet = new Set();


    roles.forEach(async (role) => {
      try {
        const foundRooms = await axios.post(`${process.env.SERVERURL}/api/discord/getrooms`, {
          roleId: role
        }, {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.USERNAME}:${process.env.PASSWORD}`).toString('base64')}`,
            'Content-Type': 'application/json'
          }
        });
        foundRooms.data.forEach(room => {
          roomIdSet.add(room.roomId);
        });
      } catch (error) {
        console.error(error);
      }
    });

    const roomIds = Array.from(roomIdSet);

    const claimCode = await axios.post(`${process.env.SERVERURL}/api/addcode`, {
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
    console.log(claimCode.data.codes[0].claimcode);
    await interaction.reply({ content: `Your code is ${process.env.SERVERURL}/join/${claimCode.data.codes[0].claimcode}`, ephemeral: true });
  }
  });
});


client.login(TOKEN);
