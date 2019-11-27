export function parseInput(line = '') {
  const [command, ...args] = line
    .split(' ')
    .map(el => el.trim().toLowerCase())
    .filter(el => el !== '');

  return [command, ...args];
}
