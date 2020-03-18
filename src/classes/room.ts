import { Expose } from 'class-transformer';
import { GameObject } from './gameObject';

export class Room {
  @Expose()
  public id = '';

  @Expose()
  public name = '';

  @Expose()
  public description = '';

  @Expose()
  public objects: GameObject[] = [];
}
