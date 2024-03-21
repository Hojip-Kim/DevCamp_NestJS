import { BaseEntity } from 'src/common';
import { User } from 'src/user/entities';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AccessToken extends BaseEntity {
  @Column()
  jti: string; // jwt token 고유식별자

  @Column()
  accessToken: string; // black-list, white-list관리를 위함

  @Column()
  isRevoke: boolean; // token이 취소되었다면 인가 불가.

  @Column({
    type: 'timestamp',
  })
  expiresAt: Date;

  @ManyToOne(() => User)
  user: User;
}
