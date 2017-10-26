import test from 'ava';
import get from 'lib/get';

test('should throw error', t => {
  t.throws(() => get());
  t.throws(() => get(undefined, null));
  t.throws(() => get(null, null));
  t.throws(() => get({}, null));
  t.throws(() => get([], null));
  t.throws(() => get(undefined, ''));
  t.throws(() => get(null, ''));
});

test('should return undefined', t => {
  t.is(get({}, 'name'), undefined);
  t.is(get({}, 'friends.1.username'), undefined);
});

test('should return object', t => {
  t.deepEqual(get({}), {});
  t.deepEqual(get([]), []);
});

test('should return array element by `id` property', t => {
  const needle = {
    id: 1,
    username: 'test',
    friends: [{ id: 2, username: 'test2' }],
  };

  t.deepEqual(get([needle], '1'), needle);
  t.deepEqual(
    get({ haystack: [needle] }, 'haystack.1.username'),
    needle.username,
  );
  t.deepEqual(
    get({ haystack: [needle] }, 'haystack.1.friends.2.username'),
    needle.friends.find(friend => friend.id === 2).username,
  );
});
