import { BaseEntity } from 'src/common';
import { Column, Entity, OneToMany, OneToOne, Relation } from 'typeorm';
import { UserRole } from './user-role.entity';
import { AccessLog, AccessToken, RefreshToken } from 'src/auth/entities';
import { Order } from 'src/payment/entities/order.entity';
import { Point } from 'src/payment/entities/point.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ nullable: true })
  userName: string;

  @Column({ nullable: true })
  userEmail: string;

  @Column({ nullable: true })
  passWord: string;

  @OneToOne(() => UserRole, (role) => role.user)
  role: UserRole;

  @OneToMany(() => AccessLog, (accessLog) => accessLog.user)
  accessLog: Relation<AccessLog[]>;

  @OneToMany(() => AccessToken, (token) => token.user)
  accessToken: Relation<AccessToken[]>;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshToken: Relation<RefreshToken[]>;

  @OneToMany(() => Order, (order) => order.user)
  orders: Relation<Order[]>;

  @OneToOne(() => Point, (point) => point.user)
  point: Relation<Point>;

  // @OneToMany()
  // accessToken : accessToken[]
}
