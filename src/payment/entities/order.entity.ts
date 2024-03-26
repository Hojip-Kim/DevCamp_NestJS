import { User } from 'src/user/entities';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { IssuedCoupon } from './issued-coupon.entity';
import { ShippingInfo } from './shipping-info.entity';

export type OrderStatus = 'started' | 'paid' | 'refunded';

@Entity()
export class Order extends BaseEntity {
  @Column()
  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @Column()
  orderNo: string;

  @Column()
  status: OrderStatus;

  @Column()
  amount: number;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: Relation<OrderItem[]>;

  @Column({ type: 'int', default: 0 })
  pointAmountUsed: number;

  @OneToMany(() => IssuedCoupon, (issuedCoupon) => issuedCoupon.usedOrder, {
    nullable: true,
  })
  @JoinColumn()
  usedIssuedCoupon: Relation<IssuedCoupon>;

  @OneToOne(() => ShippingInfo, (shippingInfo) => shippingInfo.order, {
    nullable: true,
  })
  @JoinColumn()
  shippingInfo: Relation<ShippingInfo>;

  @Column({ type: 'text', nullable: true })
  refundReason: string;

  @Column({ type: 'decimal', nullable: true })
  refundedAmount: number;

  @Column({ type: 'timestamp', nullable: true })
  refundedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  pgMetadata: any; // PG사 메타데이터

  constructor() {
    super();
    this.setOrderNo();
  }

  setOrderNo() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Array(8)
      .fill(null)
      .map(() =>
        Math.floor(Math.random() * 36)
          .toString(36)
          .toUpperCase(),
      )
      .join('');
    this.orderNo = dateStr + randomStr;
  }
}
