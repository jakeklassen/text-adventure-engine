import test from 'ava';
import createGame from 'game';
import gameSource from 'test/fixtures/game.json';

test.beforeEach(t => {
  t.context.game = createGame(gameSource);
});

test('Should return false if room cannot be found', t => {
  t.is(
    t.context.game.objectHasObjects([
      { room: 'not_found', object: 'chest', has: 'treasure' },
    ]),
    false,
  );
});

test('Should return false if room object cannot be found', t => {
  t.is(
    t.context.game.objectHasObjects([
      { room: 'test_room', object: 'chest', has: 'treasure' },
    ]),
    false,
  );
});

test('Should return false if nested object cannot be found', t => {
  t.is(
    t.context.game.objectHasObjects([
      { room: 'test_room', object: 'fusebox', has: 'sparkplug' },
    ]),
    false,
  );
});

test.skip('Should return true if nested object is found', t => {
  t.is(
    t.context.game.objectHasObjects([
      { room: 'test_room', object: 'fusebox', has: 'fuse' },
    ]),
    true,
  );
});
