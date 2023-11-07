import {
  CommandInteraction,
  PermissionsBitField,
  StringSelectMenuBuilder,
  ActionRowBuilder
} from 'discord.js';
import { addRoleToRoom } from '../data/create';
import { findUserRooms } from '../data/find';
import { RoomI } from 'discreetly-interfaces';

export async function handleAddRoleToRoomCmd(interaction: CommandInteraction, client: ) {
  if (
    interaction.member
      .permissionsIn(interaction.channel)
      .has(PermissionsBitField.Flags.Administrator)
  ) {
    const foundRooms = await findUserRooms(interaction);

    const roomChoices = foundRooms.data.rooms.map((room: RoomI) => {
      return {
        label: room.name,
        value: `${room.name}: ${room.roomId}`
      };
    });
    if (roomChoices.length === 0) {
      await interaction.reply({ content: 'You are not in any Discreetly rooms', ephemeral: true });
    } else {
      const selectRoom = new StringSelectMenuBuilder()
        .setCustomId('rooms')
        .setPlaceholder('Select Room')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(roomChoices);

      const rows = new ActionRowBuilder().addComponents(selectRoom);

      await interaction.reply({
        content: 'Select the rooms you want to add to your server',
        components: [rows],
        ephemeral: true
      });
    }

    client.on('interactionCreate', async (interaction: CommandInteraction) => {
      if (interaction.customId === 'rooms') {
        const roomId = interaction.values[0].split(': ')[1];

        const roomName = interaction.values[0].split(': ')[0];

        const roles = interaction.guild.roles.cache.map((role) => {
          return {
            label: role.name,
            value: `${role.id}: ${roomId}`
          };
        });

        const selectRole = new StringSelectMenuBuilder()
          .setCustomId('roles')
          .setPlaceholder(`Select Roles for ${roomName}`)
          .setMinValues(1)
          .setMaxValues(roles.length)
          .addOptions(roles);

        const rows = new ActionRowBuilder().addComponents(selectRole);

        await interaction.reply({
          content: `Select the roles you want to be associated with ${roomName}`,
          components: [rows],
          ephemeral: true
        });

        client.on('interactionCreate', async (interaction: CommandInteraction) => {
          if (interaction.customId === 'roles') {
            const roleIds = interaction.values.map((role) => role.split(': ')[0]);
            const roomId = interaction.values[0].split(': ')[1];
            await addRoleToRoom(roleIds, roomId, interaction);

            await interaction.reply({
              content: `Added ${roomName} to your server and users can now **/goanon** `,
              ephemeral: true
            });
          }
        });
      }
    });
  } else {
    await interaction.reply({
      content: 'You do not have permission to use this command',
      ephemeral: true
    });
  }
}
