import { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

import axios from 'axios';
import 'dotenv/config'

// TODO Move this into the Discreetly database and let it be queried with an API key/Password
export const roleMap = {
  '1063141052187426856': {
    'alpha-tester': '1406889119610943773982914340053908893373464304417165775622512450080102390258'
  },
  '1063141052187426856': {
    'explorer': '16126092212458677464797669730808312928970541841197462821829418244240512408136'
  }
};

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
    }
    )
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
    .then(command => console.log(`Created command ${command.name}`))
    .catch(console.error);
  });


  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'help') {
      await interaction.reply({ content: 'Admins can select rooms to to your server with ***/addrooms*** and users can request a code with ***/requestcode***', ephemeral: true });
    }

    if (commandName === 'addrooms') {
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
          value: room.roomId
        }
     })

      const select = new StringSelectMenuBuilder()
      .setCustomId('rooms')
      .setPlaceholder('Select Rooms')
      .setMinValues(1)
      .setMaxValues(roomChoices.length)
      .addOptions(roomChoices)

      const rows = new ActionRowBuilder()
      .addComponents(select)

      await interaction.reply({ content: 'Select the rooms you want to add to your server', components: [rows], ephemeral: true });
    }
    if (commandName === 'requestcode') {
      const discordServer = interaction.guildId;


    const member = interaction.user.id;
    const interactionMember = interaction.member;
    const roles = interactionMember.roles.cache.map(role => role.name);

    // Find the role the member has that matches a key in roleMap
    const roleRoomIds = Object.keys(roleMap[discordServer])
      .filter(roleName => interactionMember.roles.cache.some(role => role.name === roleName))
      .map(roleName => roleMap[discordServer][roleName]);


    let roomIdArr = [];

    await Promise.all(roleRoomIds.map(async (roomId) => {
      const discordIds = await axios.post(`${process.env.SERVERURL}/api/discord/users`, {
        roomId: roomId
      }, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.USERNAME}:${process.env.PASSWORD}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!discordIds.data.includes(member)) {
        roomIdArr.push(roomId);
        console.log(roomIdArr);
      }
    }));



    if (roomIdArr.length === 0) {
      return await interaction.reply("You have already received a code or don't have a proper role");
    }

    // Find the role the member has that matches a key in roleMap
    if (roleRoomIds.length > 0) {
      // TODO Generate invite code for roomId
      axios.post(`${process.env.SERVERURL}/api/addcode`, {
        numCodes: 1,
        rooms: roleRoomIds,
        all: false,
        expires: false,
        usesLeft: 1
      }, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.USERNAME}:${process.env.PASSWORD}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      })
        .then(async (response) => {
          let code = response.data.codes[0].claimcode
          await interaction.reply({ content: `Here's your code: ${process.env.CLIENTURL}/join/${code}`, ephemeral: true })
          roleRoomIds.forEach(roomId => {
            axios.post(`${process.env.SERVERURL}/api/discord/add`, {
              discordUserId: member,
              roomId: roomId,
            }, {
              headers: {
                'Authorization': `Basic ${Buffer.from(`${process.env.USERNAME}:${process.env.PASSWORD}`).toString('base64')}`,
                'Content-Type': 'application/json'
              }
            })
          })
        })
        .catch(error => {
          console.error('Error:', error);
        });

    } else {
      message.reply('You do not have the required role.');
    }

    }
  });
});


client.login(TOKEN);
