import { Exclude, Expose, plainToClass, Type } from 'class-transformer';
import { EventEmitter } from 'events';
import gameSource from '../../games/sample.json';
import { GameObject } from './gameObject';
import { Player } from './player';
import { Room } from './room';

export class Game {
  @Expose()
  public title = '';

  @Expose()
  public author = '';

  @Expose()
  public introText = '';

  @Expose()
  public winConditions = [];

  @Expose()
  public youWinText = '';

  @Expose()
  @Type(() => Player)
  public player: Player = new Player();

  @Expose()
  @Type(() => Room)
  public rooms: Room[] = [];

  @Exclude()
  private emitter = new EventEmitter();

  @Exclude()
  public getCurrentRoom(): Room {
    return this.rooms.find(room => room.id === this.player.currentRoomId)!;
  }

  @Exclude()
  public setCurrentRoom(room: Room) {
    const existingRoom = this.getRoomById(room.id);

    if (existingRoom != null) {
      this.player.currentRoomId = existingRoom.id;
    }
  }

  @Exclude()
  public getLastItemUsedId() {
    return this.player.lastItemUsedId;
  }

  @Exclude()
  public setLastItemUsedId(item: GameObject) {
    this.player.lastItemUsedId = item.id;
  }

  @Exclude()
  public getRoomById(roomId: string): Room | undefined {
    return this.rooms.find(room => room.id === roomId);
  }

  @Exclude()
  public examineObject(objectName: string) {
    const name = objectName.trim().toLowerCase();
    const gameobject = this.getCurrentRoomObjectByName(name);

    if (gameobject == null) {
      this.emitter.emit('message', `Cannot find ${name} in room.`);
      return null;
    }

    return gameobject.commands.Examine;
  }

  @Exclude()
  public getCurrentRoomObjectByName(objectName: string) {
    return this.getCurrentRoom().objects.find(
      object => object.name.trim().toLowerCase() === objectName,
    );
  }

  @Exclude()
  public describeInventory() {
    let message = `Inventory (${this.player.inventory.length}):\n\n`;

    if (this.player.inventory.length === 0) {
      message += 'You have no items';
    } else {
      this.player.inventory.forEach(item => {
        message += ` - ${item.inventoryDescription}\n`;
      });
    }

    return message;
  }

  @Exclude()
  public look() {
    const currentRoom = this.getCurrentRoom();

    let message = `${currentRoom.description}\n\nYou see: \n\n`;

    if (currentRoom.objects.length === 0) {
      message += 'An empty room...';
    } else {
      currentRoom.objects
        .filter(object => object.roomDescription != null)
        .forEach(object => {
          message += ` - ${object.roomDescription}\n`;
        });
    }

    return message;
  }

  @Exclude()
  public playerChangeRoom(roomId: string) {
    const targetRoom = this.getRoomById(roomId);

    if (!targetRoom) {
      this.emitter.emit(
        'message',
        `Possible game bug. 'player_change_room' failed: Room '${roomId}' not found.`,
      );

      return false;
    }

    this.setCurrentRoom(targetRoom);
    this.emitter.emit('message', `You entered ${targetRoom.name}.`);

    return true;
  }

  @Exclude()
  public getRoomByName(name: string): Room | undefined {
    return this.rooms.find(
      room => room.name.toLowerCase() === name.trim().toLowerCase(),
    );
  }

  @Exclude()
  public playerHasItemsById(objectIds: string[] = []) {
    return objectIds.every(objectId =>
      this.player.inventory.find(object => object.id === objectId),
    );
  }

  @Exclude()
  public playerHasItemByName(objectName = '') {
    return this.player.inventory.find(
      item => item.name.toLowerCase() === objectName.trim().toLowerCase(),
    );
  }

  @Exclude()
  public playerHasItemById(objectId = '') {
    return this.playerHasItemsById([objectId]);
  }

  @Exclude()
  public removeItemByIdFromPlayerInventory(objectId = '') {
    this.player.inventory = this.player.inventory.filter(
      object => object.id !== objectId,
    );
  }

  @Exclude()
  public getInventoryItemByName(objectName = '') {
    return this.player.inventory.find(
      object =>
        object.name.trim().toLowerCase() === objectName.trim().toLowerCase(),
    );
  }

  @Exclude()
  public dropPlayerItemByName(objectName = '') {
    const item = this.getInventoryItemByName(objectName);

    if (item == null) {
      return;
    }

    this.player.inventory = this.player.inventory.filter(
      object => object.id === item.id,
    );

    this.getCurrentRoom().objects = [...this.getCurrentRoom().objects, item];

    return item;
  }

  @Exclude()
  public playerPickupItemByName(objectName = '') {
    const name = objectName.trim().toLowerCase();
    const currentRoom = this.getCurrentRoom();
    const roomObject = currentRoom.objects.find(
      object => object.name.trim().toLowerCase() === name,
    );

    if (roomObject == null) {
      this.emitter.emit(
        'message',
        `'${objectName}' not found in current room.`,
      );

      return false;
    }

    this.player.inventory = [...this.player.inventory, roomObject];
    currentRoom.objects = currentRoom.objects.filter(
      ({ id }) => id !== roomObject.id,
    );

    return true;
  }
}
