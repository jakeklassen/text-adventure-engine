import test from 'ava';
import parseInput from 'lib/parseInput';

test('Should handle empty strings', t => {
  const [command, args] = parseInput('');

  t.is(command, undefined);
  t.is(args, undefined);
});

test('Should handle undefined', t => {
  const [command, args] = parseInput();

  t.is(command, undefined);
  t.deepEqual(args, undefined);
});

test('Should handle null', t => {
  const [command, args] = parseInput();

  t.is(command, undefined);
  t.deepEqual(args, undefined);
});

test('Should handle input with mixed casing and spaces', t => {
  const [command, ...args] = parseInput('  USE  FuSe   on Fusebox  ');

  t.is(command, 'use');
  t.deepEqual(args, ['fuse', 'on', 'fusebox']);
});
