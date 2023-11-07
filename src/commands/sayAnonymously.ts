export async function handleSayAnonymouslyCmd(interaction) {
  if (interaction.member.permissionsIn(interaction.channel).has(PermissionsBitField.Flags.Administrator)) {
    const message = interaction.options.getString('message')
    interaction.channel.send(message);
    await interaction.reply({ content: 'Message sent', ephemeral: true });
  } else {
    await interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
  }
}