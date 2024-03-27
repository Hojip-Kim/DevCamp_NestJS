import { User } from 'src/user/entities';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  Relation,
} from 'typeorm';
import { PointLog } from './point-log.entity';
import { BaseEntity } from 'src/common';

@Entity()
export class Point extends BaseEntity {
  @OneToOne(() => User, (user) => user.point)
  @JoinColumn()
  user: Relation<User>;

  @Column({ type: 'int' })
  availableAmount: number;

  @OneToMany(() => PointLog, (pointLog) => pointLog.point)
  pointLog: Relation<PointLog[]>;

  use(amountToUse: number) {
    this.availableAmount -= amountToUse;
  }

  add(amountToAdd: number){
    this.availableAmount += amountToAdd;
  }
}
