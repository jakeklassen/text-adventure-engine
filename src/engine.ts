import readline from 'readline';
import { createGame } from './game';
import { box } from './lib/box';
import { getRoomExit } from './lib/getRoomExit';
import { parseInput } from './lib/parseInput';
import { processExpression } from './lib/processExpression';

export enum Command {
  Drop = 'drop',
  Examine = 'examine',
  Go = 'go',
  Help = 'help',
  Inventory = 'inventory',
  Look = 'look',
  Pickup = 'pickup',
  Use = 'use',
  Quit = 'quit',
}

const HELP_TEXT = `Commands:

 - drop: Drop an item from inventory
 - examine: Examine an object in the room
 - go: Go direction. North, East, South and West are valid
 - help: Show commands
 - inventory: Show inventory
 - look: Look around the room
 - pickup: Try to pickup object in the room
 - use: Attempt to use an item from inventory on an object in the room
 - q/quit: Quit game
`;

const createEngine = ({
  inputManager,
  gameSource,
}: {
  inputManager: readline.Interface;
  gameSource: object;
}) => {
  const game = createGame(gameSource);

  return {
    start() {
      inputManager.prompt();
      inputManager.on('line', answer => this.loop(answer));
      inputManager.on('close', () => {
        this.quit();
      });
    },

    processCommand(expressions) {
      const boxed = box(expressions);

      for (const expression of boxed) {
        if (processExpression(game, expression) === false) {
          return false;
        }
      }

      return true;
    },

    isGameOver() {
      return this.processCommand(game.winConditions);
    },

    loop(answer: string) {
      const [command, ...rest] = parseInput(answer);

      switch (command) {
        case Command.Help:
          console.log(HELP_TEXT);
          break;

        case Command.Drop: {
          const itemName = rest.join(' ');
          const item = game.dropPlayerItemByName(itemName);

          if (!item) {
            console.log(`You are not carrying ${itemName}`);
          } else {
            console.log(`Dropped ${itemName}`);
          }

          break;
        }

        case Command.Examine: {
          const objectName = rest.join(' ');
          const examineCommand = game.examineObject(objectName);

          if (!examineCommand) {
            console.log(`Cannot examine ${objectName}`);
            break;
          }

          this.processCommand(examineCommand);
          break;
        }

        case Command.Look:
          console.log(game.look());
          break;

        case Command.Inventory:
          console.log(game.describeInventory());
          break;

        case Command.Go: {
          const direction = rest.join(' ');
          const exit = getRoomExit(game.getCurrentRoom(), direction);

          if (!exit) {
            console.log(`Cannot go ${direction}`);
            break;
          }

          this.processCommand(exit.commands.go);
          break;
        }

        case Command.Pickup: {
          const item = rest.join(' ');
          const roomObject = game
            .getCurrentRoom()
            .objects.find(object => object.name.toLowerCase() === item);

          if (roomObject == null) {
            console.log(`${item} is not in the room.`);
            break;
          }

          this.processCommand(roomObject.commands.Pickup);
          break;
        }

        case Command.Use: {
          const [itemName, targetObjectName] = rest
            .join(' ')
            .split('on')
            .map(words => words.trim());

          if (!game.playerHasItemByName(itemName)) {
            console.log(`You don't have ${itemName}`);
            break;
          }

          const roomObject = game.getCurrentRoomObjectByName(targetObjectName);

          if (roomObject == null) {
            console.log(`Cound not find ${targetObjectName} in room.`);
            break;
          }

          if (roomObject.commands.use == null) {
            console.log(`Cannot use ${itemName} on ${targetObjectName}.`);
            break;
          }

          game.setLastItemUsedId(roomObject);

          this.processCommand(roomObject.commands.use);

          break;
        }

        case 'q':
        case Command.Quit:
          inputManager.close();
          break;

        case '':
          console.log('Enter a command. Type "help" for more information');
          break;

        default:
          console.log(`Didn't understand command ${command}`);
          break;
      }

      if (this.isGameOver()) {
        console.log(game.youWinText);
        this.quit();
      }

      inputManager.prompt();
    },

    quit() {
      console.log('Quitting game\n');
      process.exit(0);
    },
  };
};

export default createEngine;
