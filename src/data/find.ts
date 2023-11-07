import axios from 'axios';
import 'dotenv/config';


export async function checkDiscordRoomCount(interaction) {
  return await axios.post(`${process.env.SERVERURL}/gateway/discord/checkrooms`, {
    discordId: interaction.guildId
  }, {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.DISCORD_USERNAME}:${process.env.DISCORD_PASSWORD}`).toString('base64')}`,
      'Content-Type': 'application/json'
    }
  }
  )
}

export async function findUserRooms(interaction) {
  return await axios.post(`${process.env.SERVERURL}/gateway/discord/rooms`, {
    discordUserId: interaction.user.id
  }, {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.DISCORD_USERNAME}:${process.env.DISCORD_PASSWORD}`).toString('base64')}`,
      'Content-Type': 'application/json'
    }
  }
 );
}

export async function getUserRooms(roles, interaction) {
  return await axios.post(`${process.env.SERVERURL}/gateway/discord/getrooms`, {
    roles: roles,
    discordId: interaction.user.id
  }, {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.DISCORD_USERNAME}:${process.env.DISCORD_PASSWORD}`).toString('base64')}`,
      'Content-Type': 'application/json'
    }
  });
}
