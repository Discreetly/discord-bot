import { Client, GatewayIntentBits, ActivityType, Interaction } from 'discord.js';
import { addDiscordToDb, createCommands } from './data/create';
import 'dotenv/config';
import { handleAddRoleToRoomCmd } from './commands/addRoleToRoom';
import { handleCreateRoomCmd } from './commands/createRoom';
import { handleHelpCmd } from './commands/help.js';
import { handleRequestInviteCmd } from './commands/requestInvite';
import { handleSayAnonymouslyCmd } from './commands/sayAnonymously';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages
  ]
});

const TOKEN = process.env.DISCORDTOKEN;

// Function to handle 'ready' event
async function handleReady() {
  console.log('Bot is ready!');
  client.user.setPresence({
    activities: [{ name: '/help to get started', type: ActivityType.Watching }],
    status: 'online'
  });
  client.guilds.cache.forEach((guild) => {
    createCommands(guild);
  });
}

// Function to handle 'guildCreate' event
async function handleGuildCreate(guild) {
  const discordId = guild.id;
  try {
    await addDiscordToDb(discordId);
    createCommands(guild);
  } catch (error) {
    console.error('Error adding guild to database', error);
  }
}

// Function to handle 'interactionCreate' event
async function handleInteractionCreate(interaction: Interaction) {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  try {
    switch (commandName) {
      case 'help':
        await handleHelpCmd(interaction);
        break;
      case 'createroom':
        await handleCreateRoomCmd(interaction);
        break;
      case 'addroletoroom':
        await handleAddRoleToRoomCmd(interaction, client);
        break;
      case 'goanon':
        await handleRequestInviteCmd(interaction);
        break;
      case 'discreetlysay':
        await handleSayAnonymouslyCmd(interaction);
        break;
      default:
        console.log(`Unknown command: ${commandName}`);
    }
  } catch (error) {
    console.error(`Error handling command: ${commandName}`, error);
  }
}

client.once('ready', handleReady);
client.on('guildCreate', handleGuildCreate);
client.on('interactionCreate', handleInteractionCreate);

client.login(TOKEN);
