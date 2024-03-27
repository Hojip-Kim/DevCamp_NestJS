import { OrderItem } from '../entities';

export type CreateOrderResponseDto = {
  orderItems: OrderItem[];
  couponId?: string;
  issuedCouponId?: string;
  pointAmountToUse?: number;
  shippingAddress?: string;
  totalAmount: number;
};
