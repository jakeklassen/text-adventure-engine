import readline from 'readline';
import createEngine from 'engine';
import { Readable } from 'stream';
import gameSource from '../../games/sample.json';

const input = new Readable({
  read() {},
});

const rl = readline.createInterface({
  input,
  output: process.stdout,
  prompt: 'What do you want to do? ',
});

const engine = createEngine({ inputManager: rl, gameSource });
engine.start();

input.push('go east\n');
input.push('look\n');
input.push('pickup fuse\n');
input.push('go west\n');
input.push('go north\n');
input.push('look\n');
input.push('go north\n');
input.push('use fuse on fuse box\n');
input.push('look\n');
input.push('go north\n');
input.push('look\n');
input.push('pickup treasure\n');
