import test from 'ava';
import createGame from 'game';
import gameSource from 'test/fixtures/game.json';

test.beforeEach(t => {
  t.context.game = createGame(gameSource);
});

test.beforeEach(t => t.context.game.emitter.removeAllListeners());

test('Should return false and not move the player', t => {
  const roomId = 'not_found';

  t.context.game.emitter.on('message', message => {
    t.is(
      message,
      `Possible game bug. 'player_change_room' failed: Room '${roomId}' not found.`,
    );
  });

  const success = t.context.game.playerChangeRoom(roomId);

  t.false(success);
  t.not(t.context.game.currentRoom.id, roomId);
});

test('Should return true and move the player', t => {
  const roomId = 'electrical_room';

  t.context.game.emitter.on('message', message => {
    const room = t.context.game.currentRoom;

    t.is(message, `You entered ${room.name}.`);
  });

  const success = t.context.game.playerChangeRoom(roomId);

  t.true(success);
  t.is(t.context.game.currentRoom.id, roomId);
});
