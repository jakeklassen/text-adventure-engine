import { Room } from '../classes/room';

export function getRoomExit(room: Room, direction) {
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
