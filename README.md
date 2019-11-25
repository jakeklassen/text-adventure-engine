# Text Adventure Engine Using Node.js

**NOTE** This is being rewritten in TypeScript. This is me publishing a 2 year old repo to github.

This engine parses and executes data driven design documents in JSON.

## How to Play the Sample Game

`yarn start`

Type `help` if you get stuck.

## Folder Structure

```
games/
  sample.json # Example game for course
src/
  examples/
    old.js          # My first working codebase. For reference.
    programmable.js # Example of command driven victory!
  expressions/
    # JSON expressions or "functions" if you will.
  lib/
    # Mostly Engine utility functions
  engine.js # Used to parse input and drive the game loop
  game.js   # Wrapper around game source JSON document
  index.js  # Entry point to play game via Engine
test/
  # Tests
  fixtures/
    game.json # Example game for testing
  ...
```
