const readline = require('readline');
const Game = require('../games/sample.json');

/*
Command reference:

All commands return Boolean

object_has_objects: [{ room: String, object: String, has: String }] objects

player_change_room: String room_id

player_has_items: [String] object_id

player_pickup_object: { room: String, object: String } object

player_remove_items: [String] [item names]

player_transfer_inventory_items_to_object: { items: [String], room: String, object: String }

player_used_item: String item name

room_get_objects: [{ room: String, objcect: String }] objects

room_update_object_room_description: { room: String, object: String, room_description: String }

show_message: String message
*/

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'What do you want to do? ',
});

function getExit(direction) {
  const currentRoom = Game.rooms.find(
    room => room.id === Game.player.current_room,
  );

  let exit = null;
  switch (direction) {
    case 'north':
    case 'east':
    case 'south':
    case 'west': {
      exit = currentRoom.objects.find(
        object => object.id === `${direction}ern_exit`,
      );
      break;
    }
    default:
      console.log(`'${direction}' is not a valid direction`);
      break;
  }

  return exit;
}

function processCommand(command = {}) {
  try {
    if (command.unless || command.if) {
      let result = false;

      if (command.unless) {
        result = command.unless.every(
          command => processCommand(command) === true,
        );
      } else {
        result = command.if.every(command => processCommand(command) === true);
      }

      if (command.if) {
        return command[result ? 'then' : 'else'].reduce(
          (res, command) => res && processCommand(command),
          true,
        );
      }

      return command[result ? 'else' : 'then'].reduce(
        (res, command) => res && processCommand(command),
        true,
      );
    }

    if (command.show_message) {
      console.log(command.show_message);
      return true;
    }

    // Object commands

    if (command.object_has_objects) {
      return command.object_has_objects.every(
        ({ room: roomId, object: objectId, has }) => {
          const room = Game.rooms.find(r => r.id === roomId);
          if (!room) return false;

          const object = room.objects.find(o => o.id === objectId);
          if (!object) return false;

          return object.objects.find(o => o.id === has);
        },
      );
    }

    // Player commands

    if (command.player_change_room) {
      const roomId = command.player_change_room;
      const targetRoom = Game.rooms.find(room => room.id === roomId);

      if (!targetRoom) {
        console.log(
          `Possible game bug. 'player_change_room' failed: Room ${roomId} not found`,
        );

        return false;
      }
      Game.player.current_room = roomId;
      console.log(`You entered ${targetRoom.name}`);

      return true;
    }

    if (command.player_has_items) {
      return command.player_has_items.every(itemName =>
        Game.player.inventory.find(
          item => item.name.toLowerCase() === itemName,
        ),
      );
    }

    if (command.player_pickup_object) {
      const { room: roomId, object: objectId } = command.player_pickup_object;

      const room = Game.rooms.find(({ id }) => id === roomId);
      Game.player.inventory.push(
        room.objects.find(object => object.id === objectId),
      );

      const firstIndex = room.objects.findIndex(
        object => object.id === objectId,
      );

      if (firstIndex !== -1) {
        room.objects = room.objects.filter((obj, idx) => idx !== firstIndex);
      }

      return true;
    }

    if (command.player_remove_items) {
      command.player_remove_items.forEach(itemId => {
        const firstIndex = Game.player.inventory.findIndex(
          item => item.id === itemId,
        );

        if (firstIndex !== -1) {
          Game.player.inventory = Game.player.inventory.filter(
            (item, idx) => idx !== firstIndex,
          );
        }
      });

      return true;
    }

    if (command.player_used_item) {
      return Game.player.last_used_item === command.player_used_item;
    }

    if (command.player_transfer_inventory_items_to_object) {
      const {
        items,
        room: roomId,
        object: objectId,
      } = command.player_transfer_inventory_items_to_object;

      const room = Game.rooms.find(r => r.id === roomId);

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

        const firstIndex = Game.player.inventory.findIndex(
          item => item.id === itemId,
        );

        if (firstIndex === -1) {
          console.log(`Bug: Player inventory does not contain ${itemId}.`);

          return false;
        }

        const [itemToTransfer] = Game.player.inventory.filter(
          (item, idx) => idx === firstIndex,
        );

        object.objects.push(itemToTransfer);
        Game.player.inventory = Game.player.inventory.filter(
          (item, idx) => idx === firstIndex,
        );
      }

      return true;
    }

    // Room commands

    if (command.room_add_objects) {
      command.room_add_objects.forEach(({ room: roomId, object }) => {
        const room = Game.rooms.find(({ id }) => id === roomId);
        room.objects.push(object);
      });

      return true;
    }

    if (command.room_remove_objects) {
      command.room_remove_objects.forEach(
        ({ room: roomId, object: objectId }) => {
          const room = Game.rooms.find(({ id }) => id === roomId);

          // There could be multiple of the same object, only take one
          const firstIndex = room.objects.findIndex(
            object => object.id === objectId,
          );

          if (firstIndex !== -1) {
            room.objects = room.objects.filter(
              (obj, idx) => idx !== firstIndex,
            );
          }
        },
      );

      return true;
    }

    if (command.room_has_objects) {
      return command.room_has_objects.every(
        ({ room: roomId, object: objectId }) => {
          const room = Game.rooms.find(room => room.id === roomId);

          if (!room) return false;

          return room.objects.find(object => object.id === objectId);
        },
      );
    }

    if (command.room_update_object_room_description) {
      const {
        room: roomId,
        object: objectId,
        room_description: roomDescription,
      } = command.room_update_object_room_description;

      const room = Game.rooms.find(r => r.id === roomId);

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

      object.roomDescription = roomDescription;

      return true;
    }

    console.log('Unrecognized command', command);

    return false;
  } catch (error) {
    console.log(error.message);
    return false;
  }
}

function processCommands(commands) {
  for (const command of commands) {
    if (processCommand(command) === false) break;
  }
}

console.log(Game.title, 'by', Game.author);
console.log();
console.log(Game.intro_text);
console.log();

// Check if player has already won
if (Game.win_conditions.map(processCommand).every(result => result === true)) {
  console.log('You won before you even started');
}

rl.prompt();

rl
  .on('line', answer => {
    const [command, ...rest] = answer
      .trim()
      .split(' ')
      .map(el => el.toLowerCase());

    console.log();

    switch (command) {
      case 'examine': {
        const objectName = rest.join(' ');

        if (!objectName) {
          console.log('You cannot examine nothing');
          break;
        }

        const room = Game.rooms.find(
          ({ id }) => id === Game.player.current_room,
        );

        const object = room.objects.find(
          obj => obj.name.toLowerCase() === objectName,
        );

        if (!object) {
          console.log(`${objectName} not found in ${room.name}`);
          break;
        }

        if (!object.commands.examine) {
          console.log(`You cannot examine ${object.name}`);
          break;
        }

        processCommands(object.commands.examine);

        break;
      }

      case 'inventory': {
        const items = Game.player.inventory;

        console.log(`Inventory (${Game.player.inventory.length}):\n`);

        if (items.length === 0) {
          console.log('You have no items');
        } else {
          items.map(item => console.log(' - ', item.inventoryDescription));
        }

        break;
      }

      case 'look': {
        const room = Game.rooms.find(
          ({ id }) => id === Game.player.current_room,
        );

        console.log(room.description);
        console.log();
        console.log('You see:\n');
        room.objects
          .filter(object => object.room_description != null)
          .map(object => console.log(' - ', object.room_description));
        console.log();

        break;
      }

      case 'go': {
        const [direction] = rest;
        const exit = getExit(direction);

        if (!exit || !exit.commands.go) {
          console.log(`Cannot go '${direction}'`);
          break;
        }

        processCommands(exit.commands.go);

        break;
      }

      case 'pickup': {
        const objectName = rest.join(' ');

        if (!objectName) {
          console.log('You cannot pickup nothing');
          break;
        }

        const room = Game.rooms.find(
          ({ id }) => id === Game.player.current_room,
        );

        const object = room.objects.find(
          obj => obj.name.toLowerCase() === objectName,
        );

        if (!object) {
          console.log(`${objectName} not found in ${room.name}`);
          break;
        }

        if (!object.commands.pickup) {
          console.log(`You cannot pickup ${object.name}`);
          break;
        }

        processCommands(object.commands.pickup);

        break;
      }

      case 'use': {
        const [itemName, targetObjectName] = rest
          .join(' ')
          .split('on')
          .map(words => words.trim());

        const playerHasItem = Game.player.inventory.find(
          item => item.name.toLowerCase() === itemName,
        );

        if (!playerHasItem) {
          console.log(`You don't have ${itemName}`);
          break;
        }

        const room = Game.rooms.find(
          ({ id }) => id === Game.player.current_room,
        );

        const target = room.objects.find(
          obj => obj.name.toLowerCase() === targetObjectName,
        );

        if (!target) {
          console.log(`Cound not find ${targetObjectName} in room.`);
          break;
        }

        if (!target.commands.use) {
          console.log(`Cannot use ${itemName} on ${targetObjectName}.`);
          break;
        }

        Game.player.last_used_item = itemName;

        processCommands(target.commands.use);

        break;
      }

      case 'quit':
      case 'q':
        rl.close();
        break;
      default:
        console.log(`Didn't understand command '${command}'`);
        break;
    }

    console.log();

    Game.player.last_used_item = '';

    // Check if player has already won
    if (
      Game.win_conditions.map(processCommand).every(result => result === true)
    ) {
      console.log('Congratulations! You won much game!');
      rl.close();
      return;
    }

    rl.prompt();
  })
  .on('close', () => {
    process.exit(0);
  });
