import { CommandInteraction, PermissionsBitField } from 'discord.js';

export async function handleHelpCmd(interaction: CommandInteraction) {
  if (
    interaction.member
      .permissionsIn(interaction.channel)
      .has(PermissionsBitField.Flags.Administrator)
  ) {
    await interaction.reply({
      content:
        "# **[Discreetly](https://app.discreetly.chat)** \n ## ***Admins*** \n - Admins **MUST** create a room and join it first or be in a previous Discreetly discord room \n `/createroom roomname` (roomname is optional) - If you don't provide a roomname, your rooms name will be random \n - If you are already in Discreetly discord rooms and you want to add those rooms to your discord server use `/addroletoroom` \n - Users can request codes to join the rooms associated with this discord server using `/goanon` \n - `/discreetlysay` 'message' will send a message in the current Discord channel anonymously",
      ephemeral: true
    });
  } else {
    await interaction.reply({
      content:
        '# **[Discreetly](https://app.discreetly.chat)** \n ## ***Users*** \n - Users can request codes to join the rooms associated with this discord server using `/goanon` \n',
      ephemeral: true
    });
  }
}
