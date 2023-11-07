import axios from 'axios';
import 'dotenv/config';


export function createCommands(guild) {
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
  }).then(command => console.log(`Created command ${command.name}`))
  .catch(console.error);

  guild.commands.create({
    name: 'discreetlysay',
    description: 'Send messages to a Discord channel anonymously',
    options: [
      {
        name: 'message',
        description: 'Message to send',
        type: 3,
      }
    ]
  }).then(command => console.log(`Created command ${command.name}`))
  .catch(console.error);
}

export async function addDiscordToDb(discordId) {
  await axios.post(`${process.env.SERVERURL}/gateway/discord/addguild`, {
    guildId: discordId
    }, {
      headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.USERNAME}:${process.env.PASSWORD}`).toString('base64')}`,
      'Content-Type': 'application/json'
    }
})
}


export async function createDiscordRoom(roomName) {
  return await axios.post(`${process.env.SERVERURL}/room/add`, {
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
}

export async function createClaimCode(interaction, roomId) {
  return await axios.post(`${process.env.SERVERURL}/admin/addcode`, {
    numCodes: 1,
    rooms:  roomId,
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
}

export async function addRoleToRoom(roleIds, roomId, interaction) {
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
}
