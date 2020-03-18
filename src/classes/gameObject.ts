import { Expose } from 'class-transformer';
import { Command } from '../engine';

type CommandKeys = keyof typeof Command;
type Commands = {
  [command in CommandKeys]: object[];
};

export class GameObject {
  @Expose()
  public id = '';

  @Expose()
  public name = '';

  @Expose()
  public roomDescription = '';

  @Expose()
  public inventoryDescription = '';

  @Expose()
  public objects: GameObject[] = [];

  @Expose()
  public commands: Partial<Commands> = {};
}

{
  'use': [
    branch.if([]).then([]),
    branch.unless([]).then([]).else([]),
    branch.if([]).then([]).elseif([]).then([]),
  ]
}
