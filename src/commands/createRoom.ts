export async function handleCreateRoomCmd(interaction) {
  if (interaction.member.permissionsIn(interaction.channel).has(PermissionsBitField.Flags.Administrator)) {
    const roomCount = await checkDiscordRoomCount(interaction);
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

          const createdRoom = await createDiscordRoom(roomName);
          const createdCode = await createClaimCode(interaction, [createdRoom.data.roomId])
          await addRoleToRoom(roleIds, createdRoom.data.roomId, interaction)

          await interaction.reply({ content: `You must claim this code before others can join your room \n Your code for ${roleName}: ${process.env.CLIENTURL}/signup/${createdCode.data.codes[0].claimcode}`, ephemeral: true });


        }
      })
    } else {
      await interaction.reply({ content: 'You have reached the maximum number of rooms for your server', ephemeral: true });
    }
  } else {
    await interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
  }
}