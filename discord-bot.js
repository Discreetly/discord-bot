const { Client, GatewayIntentBits } = require('discord.js');

export const roleMap = {
  'alpha-tester': 'Alpha Testers roomId',
  'explorer': 'PSE roomId'
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent]
});

const TOKEN = process.env.DISCORDTOKEN;


// TODO This should be stored in the prisma database instead of in PROVIDED_CODES
const PROVIDED_CODES = new Set(); // Store users who have received a code

client.once('ready', () => {
  console.log('Bot is ready!');
});

client.on('messageCreate', async (message) => {
  if (message.content === '!requestcode') {
    const member = message.guild.members.cache.get(message.author.id);

    if (PROVIDED_CODES.has(message.author.id)) {
      return message.reply('You have already received a code!');
    }

    // Find the role the member has that matches a key in roleMap
    const roleKey = Object.keys(roleMap).find(roleName => member?.roles.cache.some(role => role.name === roleName));

    if (roleKey) {
      const roomId = roleMap[roleKey];
      // TODO Generate invite code for roomId
      message.author.send(`Here's your code: https://app.discreetly.chat/join/${code}`);
      PROVIDED_CODES.add(message.author.id);
    } else {
      message.reply('You do not have the required role.');
    }
  }
});

client.login(TOKEN);
