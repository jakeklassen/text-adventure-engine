const playerChangeRoom = (game, roomId) => {
  const targetRoom = game.getRoomById(roomId);

  if (!targetRoom) {
    return [
      false,
      `Possible game bug. 'player_change_room' failed: Room ${roomId} not found.`,
    ];
  }

  game.currentRoom = roomId;

  return [true, `You entered ${targetRoom.name}.`];
};

export default playerChangeRoom;
