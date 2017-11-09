import parseInput from 'lib/parseInput';
import processExpression from 'lib/processExpression';
import getRoomExit from 'lib/getRoomExit';
import box from 'lib/box';
import createGame from 'game';

const HELP_TEXT = `Commands:

 - drop: Drop an item from inventory
 - examine:Eexmaine an object in the room
 - go: Go direction. North, East, South and West are valid
 - help: Show commands
 - inventory: Show inventory
 - look: Look around the room
 - pickup: Try to pickup object in the room
 - use: Attempt to use an item from inventory on an object in the room
 - q/quit: Quit game
`;

const createEngine = ({ inputManager, gameSource }) => {
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
        if (processExpression(game, expression) === false) return false;
      }

      return true;
    },

    isGameOver() {
      return this.processCommand(game.winConditions);
    },

    loop(answer) {
      const [command, ...rest] = parseInput(answer);

      switch (command) {
        case 'help':
          console.log(HELP_TEXT);
          break;

        case 'drop': {
          const itemName = rest.join(' ');
          const item = game.playerDropItem(itemName);

          if (!item) {
            console.log(`You are not carrying ${itemName}`);
          } else {
            console.log(`Dropped ${itemName}`);
          }

          break;
        }

        case 'examine': {
          const objectName = rest.join(' ');
          const goCommand = game.examineObject(objectName);

          if (!goCommand) {
            console.log(`Cannot examine ${objectName}`);
            break;
          }

          this.processCommand(goCommand);
          break;
        }

        case 'look':
          console.log(game.look());
          break;

        case 'inventory':
          console.log(game.describeInventory());
          break;

        case 'go': {
          const direction = rest.join(' ');
          const exit = getRoomExit(game.currentRoom, direction);

          if (!exit) {
            console.log(`Cannot go ${direction}`);
            break;
          }

          this.processCommand(exit.commands.go);
          break;
        }

        case 'pickup': {
          const item = rest.join(' ');
          const object = game.currentRoom.objects.find(
            object => object.name.toLowerCase() === item,
          );

          if (!object) {
            console.log(`${item} is not in the room.`);
            break;
          }

          this.processCommand(object.commands.pickup);
          break;
        }

        case 'use': {
          const [itemName, targetObjectName] = rest
            .join(' ')
            .split('on')
            .map(words => words.trim());

          if (!game.playerHasItem(itemName)) {
            console.log(`You don't have ${itemName}`);
            break;
          }

          const target = game.getObjectByName(targetObjectName);

          if (!target) {
            console.log(`Cound not find ${targetObjectName} in room.`);
            break;
          }

          if (!target.commands.use) {
            console.log(`Cannot use ${itemName} on ${targetObjectName}.`);
            break;
          }

          game.lastItemUsed = itemName;

          this.processCommand(target.commands.use);

          break;
        }

        case 'q':
        case 'quit':
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
