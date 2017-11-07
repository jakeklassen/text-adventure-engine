import parseInput from 'lib/parseInput';
import createGame from 'game';

function findRoomExit(room, direction) {
  let exit = null;

  switch (direction) {
    case 'north':
    case 'east':
    case 'south':
    case 'west': {
      exit = room.objects.find(object => object.id === `${direction}ern_exit`);
      break;
    }
    default:
      break;
  }

  return exit;
}

// Commands
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

//
// RANDOM
//

function processExpression(game, expression = {}) {
  try {
    if (expression.unless || expression.if) {
      let result = false;

      if (expression.unless) {
        result = expression.unless.every(
          expression => processExpression(game, expression) === true,
        );
      } else {
        result = expression.if.every(
          expression => processExpression(game, expression) === true,
        );
      }

      if (expression.if) {
        return expression[result ? 'then' : 'else'].reduce(
          (res, expression) => res && processExpression(game, expression),
          true,
        );
      }

      return expression[result ? 'else' : 'then'].reduce(
        (res, expression) => res && processExpression(game, expression),
        true,
      );
    }

    if (expression.show_message) {
      console.log(expression.show_message);
      return true;
    }

    // Object commands

    if (expression.object_has_objects) {
      return expression.object_has_objects.every(
        ({ room: roomId, object: objectId, has }) => {
          const room = game.getRoomById(roomId);

          if (!room) return false;

          const object = room.objects.find(o => o.id === objectId);
          if (!object) return false;

          return object.objects.find(o => o.id === has);
        },
      );
    }

    // Player commands

    if (expression.player_change_room) {
      const roomId = expression.player_change_room;
      const targetRoom = game.getRoomById(roomId);

      if (!targetRoom) {
        console.log(
          `Possible game bug. 'player_change_room' failed: Room ${roomId} not found`,
        );

        return false;
      }

      game.currentRoom = roomId;
      console.log(`You entered ${targetRoom.name}`);

      return true;
    }

    if (expression.player_has_items) {
      return expression.player_has_items.every(itemId =>
        game.playerHasItemById(itemId),
      );
    }

    if (expression.player_pickup_item) {
      const objectName = expression.player_pickup_item;

      if (!game.playerPickupItem(objectName)) return false;

      console.log(`Picked up ${objectName}\n`);

      return true;
    }

    if (expression.player_remove_items) {
      expression.player_remove_items.forEach(itemId => {
        const firstIndex = game.player.inventory.findIndex(
          item => item.id === itemId,
        );

        if (firstIndex !== -1) {
          game.player.inventory = game.player.inventory.filter(
            (item, idx) => idx !== firstIndex,
          );
        }
      });

      return true;
    }

    if (expression.player_used_item) {
      return game.lastItemUsed === expression.player_used_item;
    }

    if (expression.player_transfer_inventory_items_to_object) {
      const {
        items,
        room: roomId,
        object: objectId,
      } = expression.player_transfer_inventory_items_to_object;

      const room = game.getRoomById(roomId);

      if (!room) {
        console.log(`Bug: room id ${roomId} not found.`);

        return false;
      }

      const object = room.objects.find(o => o.id === objectId);

      if (!object) {
        console.log(
          `Bug: object by id ${objectId} not found in room ${roomId}`,
        );

        return false;
      }

      for (let i = 0; i < items.length; i += 1) {
        const itemId = items[i];

        const item = game.playerHasItemById(itemId);

        if (!item) {
          console.log(`Bug: Player inventory does not contain ${itemId}.`);

          return false;
        }

        object.objects.push(item);
        game.playerInventoryRemoveItemById(item.id);
      }

      return true;
    }

    // Room commands

    if (expression.room_add_objects) {
      expression.room_add_objects.forEach(({ room: roomId, object }) => {
        const room = game.rooms.find(({ id }) => id === roomId);
        room.objects.push(object);
      });

      return true;
    }

    if (expression.room_remove_objects) {
      expression.room_remove_objects.forEach(
        ({ room: roomId, object: objectId }) => {
          const room = game.getRoomById(roomId);

          // There could be multiple of the same object, only take one
          const object = room.objects.find(object => object.id === objectId);

          if (object) {
            room.objects = room.objects.filter(obj => obj.id !== object.id);
          }
        },
      );

      return true;
    }

    if (expression.room_has_objects) {
      return expression.room_has_objects.every(
        ({ room: roomId, object: objectId }) => {
          const room = game.getRoomById(roomId);

          if (!room) return false;

          return room.objects.find(object => object.id === objectId);
        },
      );
    }

    if (expression.room_update_object_room_description) {
      const {
        room: roomId,
        object: objectId,
        room_description: roomDescription,
      } = expression.room_update_object_room_description;

      const room = game.getRoomById(roomId);

      if (!room) {
        console.log(`Bug: room id ${roomId} not found.`);

        return false;
      }

      const object = room.objects.find(o => o.id === objectId);

      if (!object) {
        console.log(
          `Bug: object by id ${objectId} not found in room ${roomId}`,
        );

        return false;
      }

      object.room_description = roomDescription;

      return true;
    }

    console.log('Unrecognized command', expression);

    return false;
  } catch (error) {
    console.log(error.message);
    return false;
  }
}

const box = items => (Array.isArray(items) ? items : [items]);

const createEngine = ({ inputManager, gameSource }) => {
  const game = createGame(gameSource);

  return {
    get game() {
      return game;
    },

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
      console.log();

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
          const exit = findRoomExit(game.currentRoom, direction);

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

          const playerHasItem = game.playerHasItem(itemName);

          if (!playerHasItem) {
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

      console.log();
      inputManager.prompt();
    },

    quit() {
      console.log('Quitting game\n');
      process.exit(0);
    },
  };
};

export default createEngine;
