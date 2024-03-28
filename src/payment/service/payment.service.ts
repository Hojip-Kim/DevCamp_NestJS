import { HttpStatus, Injectable } from '@nestjs/common';
import { IssuedCouponRepository } from '../repositories/issued-coupon.repository';
import { OrderRepository } from '../repositories/order.repository';
import { ShippingInfoRepository } from '../repositories';
import { Order, OrderItem } from '../entities';
import { ProductService } from './product.service';
import { UserRepository } from 'src/user/repositories/user.repository';
import { User } from 'src/user/entities';
import { BusinessException } from 'src/exception/BusinessException';
import { CreateOrderRequestDto } from '../dto/createOrder-Request.dto';
import { Transactional } from 'typeorm-transactional';
import { TossDto } from '../dto/tossPayment.dto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { v4 as uuid_v4 } from 'uuid';

@Injectable()
export class PaymentService {
  constructor(
    private readonly issuedCouponRepository: IssuedCouponRepository,
    private readonly userRepository: UserRepository,
    private readonly orderRepository: OrderRepository,
    private readonly shippingInfoRepository: ShippingInfoRepository,
    private readonly productService: ProductService,
    private readonly configService: ConfigService,
  ) {}
  private readonly tossUrl = 'https://api.tosspayments.com/v1/payments';
  private readonly secretKey = this.configService.get<string>('TOSS_SECRET');

  async tossPayment(tossDto: TossDto) {
    try {
      const idempotency = uuid_v4();

      const { paymentKey, orderId, amount } = tossDto;


      const response = await axios.post(
        `${this.tossUrl}/${paymentKey}`,
        {
          orderId,
          amount,
        },
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.secretKey}:`).toString('base64')}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': `${idempotency}`,
          },
        },
      );

      const findOrder = await this.orderRepository.findOneBy({
        orderNo: orderId,
      });

      if (!findOrder) {
        throw new BusinessException(
          'payment',
          'Not-found-order',
          'Not-found-order',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!response) {
        throw new BusinessException(
          'payment',
          'Toss-payments-error',
          'Toss-payments-error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (response.data.orderId !== findOrder.orderNo) {
        throw new BusinessException(
          'payment',
          'Order-Miss-Match',
          'Order-Miss-Match',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (response.data.amount !== findOrder.amount) {
        throw new BusinessException(
          'payment',
          'Amount-Miss-Match',
          'Amount-Miss-Match',
          HttpStatus.BAD_GATEWAY,
        );
      }

      const order = await this.completeOrder(orderId);

      return {
        paymentKey: paymentKey,
        orderId: order.orderNo,
        amount: order.amount,
      };
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
    }
  }
  /*
  주문하고자하는 상품의 가격의 합을 통해 쿠폰, 포인트 사용우무에따라 할인을 적용,
  최종 주문 가격을 통해 Order Entity를 생성합니다.
  */
  @Transactional()
  async initOrder(
    userId: string,
    orderDto: CreateOrderRequestDto,
  ): Promise<Order> {
    const totalAmount = await this.calculateAmount(orderDto.orderItems);

    const user = await this.userRepository.findOneBy({ id: userId });

    const finalAmount = await this.applyDiscount(
      user,
      totalAmount,
      orderDto.pointAmountToUse,
      orderDto.couponId,
      orderDto.issuedCouponId,
    );

    return await this.createOrder(
      user,
      orderDto.orderItems,
      finalAmount,
      orderDto.shippingAddress,
    );
  }

  /*
  Order를 Complete합니다.
  결제금액이 'paid', 즉 결제완료되면 사용되는 메소드입니다.
  */
  @Transactional()
  async completeOrder(orderId: string): Promise<Order> {
    return await this.orderRepository.completeOrder(orderId);
  }

  /*
  Order를 생성하는 메소드입니다.
  배송상태를 'ordered'로 만들어주고, 배송상태에 대한 entity를 생성 및
  Order Entity를 생성하는 메소드입니다.
   */
  @Transactional()
  async createOrder(
    user: User,
    orderItems: OrderItem[],
    finalAmount: number,
    shippingAddress: string,
  ): Promise<Order> {
    const shippingInfo =
      await this.shippingInfoRepository.createShippingInfo(shippingAddress);

    const order = this.orderRepository.createOrder(
      user,
      orderItems,
      finalAmount,
      shippingInfo,
    );

    return order;
  }

  /* 주문 Items의 price와, 해당 Item의 quantity를 합친 Total 금액을 계산합니다.*/
  async calculateAmount(orderItems: OrderItem[]): Promise<number> {
    let totalAmount = 0;

    const productIds = orderItems.map((e) => e.productId);
    const products = await this.productService.findProductById(productIds); // Product[]의 형태

    for (const item of orderItems) {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        throw new BusinessException(
          'payment',
          'Product-not-found',
          'product-not-found',
          HttpStatus.BAD_REQUEST,
        );
      }
      totalAmount += product.price * item.quantity;
    }

    return totalAmount;
  }

  /*
  할인액을 계산합니다.
  1. 포인트와 쿠폰을 같이 사용하는 경우 : 총 금액에서 포인트만큼 먼저 빼고, 남은 금액에서 쿠폰을 적용하여 남은 금액을 return합니다.
  2. 포인트를 사용하지않고, 쿠폰만 사용하는 경우 : 총 금액에서 쿠폰 퍼센테이지만큼을 빼고 return합니다.
  3. 포인트만 사용하고, 쿠폰을 사용하지 않는경우 : 총 금액에서 포인트만큼 차감하고 return합니다.
  위의 모든 경우에서, 총 금액보다 할인을 적용했을 때 return되는 금액이 작다면, 0원을 return합니다.
  */
  private async applyDiscount(
    user: User,
    amount: number,
    amoutToUsePoint?: number,
    couponId?: string,
    issuedCouponId?: string,
  ): Promise<number> {
    let totalAmount = amount;

    const pointDiscount = amoutToUsePoint
      ? await this.applyPoint(user, amoutToUsePoint)
      : 0;
    let couponDiscount = 0;

    if (couponId && issuedCouponId) {
      couponDiscount =
        pointDiscount === 0
          ? await this.applyCoupon(user, couponId, issuedCouponId, amount)
          : await this.applyCoupon(
              user,
              couponId,
              issuedCouponId,
              amount - pointDiscount,
            );
    }
    const finalAmount = totalAmount - (pointDiscount + couponDiscount);
    return finalAmount < 0 ? 0 : finalAmount;
  }

  /*
  point 관련 메서드. - 할인 금액을 return합니다.
   client단에서 들어온 '사용할 만큼의 포인트'가 유저가 갖고있는 양보다 크다면 exception
 '사용할 만큼의 포인트'가 유저가 갖고있는 양보다 적다면 정상 실행
 
 */
  async applyPoint(
    user: User,
    amountToUse: number,
    reason?: string,
  ): Promise<number> {
    const avaliablePoint = user.point.availableAmount;

    if (amountToUse < 0 || avaliablePoint < amountToUse) {
      throw new BusinessException(
        'payment',
        'Invalid-point',
        'Invalid-point',
        HttpStatus.BAD_REQUEST,
      );
    }

    return amountToUse;
  }
  /*
  coupon관련 메서드
  1. fixed(고정 할인가격 쿠폰) : 해당 쿠폰의 가격만큼 할인이 되므로, coupon의 value를 return합니다
  2. percent(가격 할인 퍼센티지 쿠폰) : 금액의 퍼센티지만큼 할인이 되므로, 적용하고자 하는 금액 * coupon.value / 100만큼 return합니다.
   */
  async applyCoupon(
    user: User,
    couponId: string,
    issuedCouponId: string,
    amount: number,
  ): Promise<number> {
    const issuedCoupon = await this.issuedCouponRepository.findOne({
      where: {
        coupon: { id: couponId },
        issuedCouponID: issuedCouponId,
        user: { id: user.id },
      },
    });
    if (!issuedCoupon) {
      throw new BusinessException(
        'payment',
        'Invalid-Issued-Coupon',
        'Invalid-Issued-Coupon',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isValid =
      issuedCoupon?.isValid &&
      issuedCoupon?.validFrom <= new Date() &&
      issuedCoupon?.validUntil > new Date();

    if (!isValid) {
      throw new BusinessException(
        'payment',
        'Coupon-Not-Valid',
        'Coupon-Not-Valid',
        HttpStatus.BAD_REQUEST,
      );
    }
    const { coupon } = issuedCoupon;

    if (coupon.couponType === 'fixed') {
      return coupon.value;
    } else if (coupon.couponType === 'percent') {
      return (amount * coupon.value) / 100;
    }
    return 0;
  }
}
