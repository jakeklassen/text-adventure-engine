import test from 'ava';
import createGame from 'game';
import gameSource from 'test/fixtures/game.json';

test.beforeEach(t => {
  t.context.game = createGame(gameSource);
});

test.beforeEach(t => t.context.game.emitter.removeAllListeners());

test('Should return false when object is not in the current room', t => {
  const objectName = 'Fuse';

  t.context.game.emitter.on('message', message => {
    t.is(message, `'${objectName}' not found in current room.`);
  });

  t.is(t.context.game.playerPickupItem(objectName), false);
});

test('Should add item to players inventory', t => {
  t.context.game.playerChangeRoom('electrical_room');

  t.is(t.context.game.playerPickupItem('Fuse'), true);
  t.true(t.context.game.playerHasItems(['fuse']));
});
