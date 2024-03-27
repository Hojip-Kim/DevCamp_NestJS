import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Coupon,
  IssuedCoupon,
  Order,
  OrderItem,
  Point,
  PointLog,
  Product,
  ShippingInfo,
} from './entities';
import { UserModule } from 'src/user/user.module';
import { PaymentController } from './controller/payment.controller';
import { PaymentService } from './service/payment.service';
import {
  CouponRepository,
  IssuedCouponRepository,
  OrderItemRepository,
  OrderRepository,
  PointLogRepository,
  PointRepository,
  ProductRepository,
  ShippingInfoRepository,
} from './repositories';
import { ProductService } from './service/product.service';
import { CouponService } from './service/coupon.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([
      Coupon,
      IssuedCoupon,
      OrderItem,
      Order,
      PointLog,
      Point,
      Product,
      ShippingInfo,
    ]),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    CouponRepository,
    IssuedCouponRepository,
    OrderItemRepository,
    OrderRepository,
    PointLogRepository,
    PointRepository,
    ProductRepository,
    ShippingInfoRepository,
    ProductService,
    CouponService
  ],
  exports: [
    PaymentService,
    CouponRepository,
    IssuedCouponRepository,
    OrderItemRepository,
    OrderRepository,
    PointLogRepository,
    PointRepository,
    ProductRepository,
    ShippingInfoRepository,
    ProductService,
    CouponService
  ],
})
export class PaymentModule {}

