import { BaseEntity, Column, Entity, OneToOne, Relation } from 'typeorm';
import { Order } from './order.entity';
import { text } from 'stream/consumers';

export type shippingType =
  | 'ordered' // 주문 완료
  | 'shipping' // 출고 준비 중
  | 'shipped' // 출고 완료
  | 'delivering' // 배송 중
  | 'delivered'; // 배송 완료

@Entity()
export class ShippingInfo extends BaseEntity {
  @OneToOne(() => Order, (order) => order.shippingInfo)
  order: Relation<Order>;

  @Column()
  status: ShippingInfo; // 배송 상태

  @Column({ type : 'text' })
  address: string; // 주문자 주소

  @Column({nullable : true})
  trackingNumber : string; // 운송장번호

  @Column({ nullable : true})
  shippingCompany : string; // 배송 회사

}
