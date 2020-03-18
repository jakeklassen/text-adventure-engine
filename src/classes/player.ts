import { Expose } from 'class-transformer';
import { GameObject } from './gameObject';

export class Player {
  @Expose()
  public currentRoomId = '';

  @Expose()
  public inventory: GameObject[] = [];

  @Expose()
  public lastItemUsedId = '';
}
