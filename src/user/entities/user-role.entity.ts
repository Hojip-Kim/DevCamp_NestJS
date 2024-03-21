import { BaseEntity } from 'src/common';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum Role {
  User = 'user',
  Admin = 'admin',
}

@Entity()
export class UserRole extends BaseEntity {

  @Column({
    type: 'varchar',
  })
  role: Role;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;
}
