import 'reflect-metadata';

import readline from 'readline';
import gameSource from '../games/sample.json';
import createEngine from './engine';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'What do you want to do? ',
});

const engine = createEngine({ inputManager: rl, gameSource });
engine.start();
