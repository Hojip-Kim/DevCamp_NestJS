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
  @PrimaryGeneratedColumn()
  id: string;

  @Column({
    type: 'varchar',
  })
  role: Role;

  @OneToOne(() => User, (user) => user.role, { eager: true })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;
}
