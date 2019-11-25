export default function processExpression(game, expression = {}) {
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
