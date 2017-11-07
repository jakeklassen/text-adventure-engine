import readline from 'readline';
import createEngine from 'engine';
import gameSource from '../games/sample.json';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'What do you want to do? ',
});

const engine = createEngine({ inputManager: rl, gameSource });
engine.start();
