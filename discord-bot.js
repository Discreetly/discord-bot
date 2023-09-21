import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import 'dotenv/config'

// TODO Move this into the Discreetly database and let it be queried with an API key/Password
export const roleMap = {
  '1123434145423560794': {
    'alpha-tester': '1406889119610943773982914340053908893373464304417165775622512450080102390258'
  },
  '943612659163602974': {
    'explorer': '16126092212458677464797669730808312928970541841197462821829418244240512408136'
  }
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages]
});

const TOKEN = process.env.DISCORDTOKEN

// TODO This should be stored in the prisma database instead of in PROVIDED_CODES
const PROVIDED_CODES = new Set(); // Store users who have received a code

client.once('ready', () => {
  console.log('Bot is ready!');
});

client.on('messageCreate', async (message) => {
  if (message.content === '!requestcode') {
    const discordServer = message.guild.id;

    if (!roleMap[discordServer]) {
      return message.reply('This server is not configured.');
    }

    const member = message.guild.members.cache.get(message.author.id);

    if (PROVIDED_CODES.has(message.author.id)) {
      return message.reply('You have already received a code!');
    }

    // Find the role the member has that matches a key in roleMap
    const roleRoomIds = Object.keys(roleMap[discordServer])
      .filter(roleName => member?.roles.cache.some(role => role.name === roleName))
      .map(roleName => roleMap[discordServer][roleName]);


    if (roleRoomIds.length > 0) {
      // TODO Generate invite code for roomId
      axios.post(`https://server.discreetly.chat/api/addcode`, {
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
        .then(response => {
          let code = response.data.codes[0].claimcode
          message.reply({ content: `Here's your code: https://app.discreetly.chat/join/${code}`, ephemeral: true })
          message.author.send(`Here's your code: https://app.discreetly.chat/join/${code}`);
          PROVIDED_CODES.add(message.author.id);
        })
        .catch(error => {
          console.error('Error:', error);
        });

    } else {
      message.reply('You do not have the required role.');
    }
  }
});

client.login(TOKEN);
