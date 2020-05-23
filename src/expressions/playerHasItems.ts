import { Player } from '../classes/player';

export const playerHasItems = (player: Player, itemIds: string[]) =>
  itemIds.every(
    itemId => player.inventory.find(item => item.id === itemId) != null,
  );
