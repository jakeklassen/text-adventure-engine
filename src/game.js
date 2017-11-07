/* eslint no-console: "error" */

// Interface to the JSON game data
import { EventEmitter } from 'events';

const createGame = gameSource => {
  const game = JSON.parse(JSON.stringify(gameSource));
  // Validate against JSON Schema at this point

  return {
    emitter: new EventEmitter(),

    get currentRoom() {
      return game.rooms.find(room => room.id === game.player.current_room);
    },

    set currentRoom(roomId) {
      if (!this.getRoomById(roomId)) return;

      game.player.current_room = roomId;
    },

    get lastItemUsed() {
      return game.player.last_item_used;
    },

    set lastItemUsed(itemName) {
      game.player.last_item_used = itemName;
    },

    examineObject(objectName = '') {
      const name = objectName.trim().toLowerCase();
      const object = this.getObjectByName(name);

      if (!object) {
        this.emitter.emit('message', `Cannot find ${name} in room.`);
        return null;
      }

      return object.commands.go;
    },

    getObjectByName(objectName) {
      return this.currentRoom.objects.find(
        object => object.name.trim().toLowerCase() === objectName,
      );
    },

    describeInventory() {
      let message = `Inventory (${this.playerInventory.length}):\n\n`;

      if (this.playerInventory.length === 0) {
        message += 'You have no items';
      } else {
        this.playerInventory.forEach(item => {
          message += ` - ${item.inventory_description}\n`;
        });
      }

      return message;
    },

    look() {
      let message = `${this.currentRoom.description}\n\nYou see: \n\n`;

      if (this.currentRoom.objects.length === 0) {
        message += 'An empty room...';
      } else {
        this.currentRoom.objects
          .filter(object => object.room_description != null)
          .forEach(object => {
            message += ` - ${object.room_description}\n`;
          });
      }

      return message;
    },

    playerChangeRoom(roomId) {
      const targetRoom = this.getRoomById(roomId);

      if (!targetRoom) {
        this.emitter.emit(
          'message',
          `Possible game bug. 'player_change_room' failed: Room '${roomId}' not found.`,
        );

        return false;
      }

      this.currentRoom = roomId;
      this.emitter.emit('message', `You entered ${targetRoom.name}.`);

      return true;
    },

    getRoomById(roomId) {
      return game.rooms.find(room => room.id === roomId);
    },

    getRoomByName(name = '') {
      return game.rooms.find(
        room => room.name.toLowerCase() === name.toLowerCase(),
      );
    },

    objectHasObjects(objects = []) {
      return objects.every(({ room: roomId, object: objectId, has }) => {
        const room = game.rooms.find(room => room.id === roomId);

        if (!room) return false;

        const object = room.objects.find(o => o.id === objectId);
        if (!object) return false;

        return object.objects.find(o => o.id === has);
      });
    },

    playerHasItems(objectIds = []) {
      if (objectIds.length === 0) return false;

      return objectIds.every(objectId =>
        game.player.inventory.find(object => object.id === objectId),
      );
    },

    playerHasItem(objectName = '') {
      return this.playerInventory.find(
        item => item.name.toLowerCase() === objectName,
      );
    },

    playerHasItemById(objectId = '') {
      return this.playerInventory.find(item => item.id === objectId);
    },

    get playerInventory() {
      return game.player.inventory;
    },

    set playerInventory(inventory = []) {
      game.player.inventory = inventory;
    },

    playerInventoryRemoveItemById(itemId = '') {
      this.playerInventory = this.playerInventory.filter(
        item => item.id !== itemId,
      );
    },

    getInventoryItem(objectName = '') {
      return this.playerInventory.find(
        object =>
          object.name.trim().toLowerCase() === objectName.trim().toLowerCase(),
      );
    },

    playerDropItem(objectName = '') {
      const item = this.getInventoryItem(objectName);

      if (!item) return null;

      this.playerInventory = this.playerInventory.filter(
        object => object.id !== item.id,
      );

      this.currentRoom.objects = [...this.currentRoom.objects, item];

      return item;
    },

    playerPickupItem(objectName = '') {
      const name = objectName.trim().toLowerCase();
      const object = this.currentRoom.objects.find(
        object => object.name.trim().toLowerCase() === name,
      );

      if (!object) {
        this.emitter.emit(
          'message',
          `'${objectName}' not found in current room.`,
        );

        return false;
      }

      this.playerInventory = [...this.playerInventory, object];
      this.currentRoom.objects = this.currentRoom.objects.filter(
        ({ id }) => id !== object.id,
      );

      return true;
    },

    get youWinText() {
      return game.you_win_text;
    },

    get winConditions() {
      return game.win_conditions;
    },
  };
};

export default createGame;
