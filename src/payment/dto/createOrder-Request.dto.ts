import { OrderItem } from '../entities';

export type CreateOrderRequestDto = {
  orderItems: OrderItem[];
  couponId?: string;
  issuedCouponId?: string;
  pointAmountToUse?: number;
  shippingAddress: string;
};
