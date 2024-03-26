import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { IssuedCoupon } from './issued-coupon.entity';

export type CouponType = 'percent' | 'fixed';

@Entity()
export class Coupon extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  couponType: CouponType;

  @Column()
  couponName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  value: number;

  @Column({ type: 'int', nullable: true })
  maxIssue?: number;

  @OneToMany(() => IssuedCoupon, (IssuedCoupon) => IssuedCoupon.coupon)
  issuedCoupon: Relation<IssuedCoupon[]>;
}
