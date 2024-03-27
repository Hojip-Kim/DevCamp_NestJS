import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  Relation,
} from 'typeorm';
import { Order } from './order.entity';
import { User } from 'src/user/entities';
import { Coupon } from './coupon.entity';
import { BaseEntity } from 'src/common';

@Entity()
export class IssuedCoupon extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn()
  user: Relation<User>;

  @Column()
  issuedCouponID: string; // 쿠폰 고유 식별번호

  @ManyToOne(() => Coupon)
  @JoinColumn()
  coupon: Relation<Coupon>;

  @ManyToOne(() => Order, (order) => order.usedIssuedCoupon, { nullable: true })
  usedOrder: Relation<Order>;

  @Column({ type: 'boolean', default: false })
  isValid: boolean;

  @Column({ type: 'timestamp', nullable: false })
  validFrom: Date;

  @Column({ type: 'timestamp', nullable: false })
  validUntil: Date;

  @Column({ type: 'boolean', default: false })
  isUsed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date;

  use() {
    this.isUsed = true;
    this.isValid = false;
    this.usedAt = new Date();
  }

  createCouponID(): void {
    // 16자리수의 랜덤 string을 만들어냅니다. (Ex - 20240326YNYCBWC6)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Array(8)
      .fill(null)
      .map(() =>
        Math.floor(Math.random() * 36)
          .toString(36)
          .toUpperCase(),
      )
      .join('');
    this.issuedCouponID = dateStr + randomStr;
  }
}
