const playerHasItems = game => {
  expression.player_has_items.every(itemName =>
    game.player.inventory.find(item => item.name.toLowerCase() === itemName),
  );
};

export default playerHasItems;
