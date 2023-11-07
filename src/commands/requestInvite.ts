export async function handleRequestInviteCmd(interaction) {

  const interactionMember = interaction.member;
  const roles = interactionMember.roles.cache.map(role => role.id);

  let roomIdSet = new Set();
  let roomNames = '';

  try {
    const foundRooms = await getUserRooms(roles, interaction);
    if (foundRooms.data.rooms.length === 0) {
      await interaction.reply({ content: 'No Discreetly rooms associated with this Discord Server', ephemeral: true });
    }
    foundRooms.data.rooms.forEach(room => {
      roomIdSet.add(room);
    })
    foundRooms.data.roomNames.forEach((room, index) => {
      if (index === foundRooms.data.roomNames.length - 1) {
        roomNames += room;
      } else {
        roomNames += room + ', ';
      }
    })
  } catch (error) {
    console.error(error);
  }
  const roomIds = Array.from(roomIdSet);
  const claimCode = await createClaimCode(interaction, roomIds)

  await interaction.reply({ content: `An invite code lets you join a discreetly room only once with your username. \n **Please don't share it!** \n \n Code(s) for: **${roomNames}** \n \n  Your invite link is ${process.env.CLIENTURL}/signup/${claimCode.data.codes[0].claimcode}`, ephemeral: true });
}