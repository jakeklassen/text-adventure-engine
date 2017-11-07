import test from 'ava';
import createGame from 'game';
import gameSource from 'test/fixtures/game.json';

test.beforeEach(t => {
  t.context.game = createGame(gameSource);
  t.context.game.playerChangeRoom('electrical_room');
  t.context.game.playerPickupItem('Fuse');
});

test('Should return false with an empty inventory', t => {
  t.is(t.context.game.playerHasItems(['not_found']), false);
});

test('Should return false with an empty inventory', t => {
  t.is(t.context.game.playerHasItems(['fuse']), true);
});
