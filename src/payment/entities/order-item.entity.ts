import { BaseEntity, Column, ManyToOne, Relation } from 'typeorm';
import { Order } from './order.entity';

export class OrderItem extends BaseEntity {
  @ManyToOne(() => Order, (order) => order.items)
  order: Relation<Order>;

  @Column()
  productId: string;

  @Column()
  quantity: number;
}
