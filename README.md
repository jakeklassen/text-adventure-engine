# Text Adventure Engine Using Node.js

Source code for Udemy course.

This engine parses and executes data driven design documents in JSON.

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

