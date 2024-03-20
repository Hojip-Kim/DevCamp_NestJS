import { BaseEntity } from 'src/common';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './user-role.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: true })
  userName: string;

  @Column({ nullable: true })
  userEmail: string;

  @Column({ nullable: true })
  passWord: string;

  @OneToOne(() => UserRole, (role) => role.user)
  role: UserRole;

  // @OneToMany()
  // accessToken : accessToken[]
}
