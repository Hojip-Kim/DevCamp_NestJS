import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { ShippingInfo } from '../entities/shipping-info.entity';
import { UserRepository } from 'src/user/repositories/user.repository';
import { User } from 'src/user/entities';
import { IssuedCouponRepository } from './issued-coupon.repository';
import { PointRepository } from './point.repository';
import { BusinessException } from 'src/exception/BusinessException';

@Injectable()
export class OrderRepository extends Repository<Order> {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly issuedCouponRepository: IssuedCouponRepository,
    private readonly pointRepository: PointRepository,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async createOrder(
    user: User,
    orderItems: OrderItem[],
    amount: number,
    shippingInfo?: ShippingInfo,
  ): Promise<Order> {
    const order = new Order();
    order.user = user;
    order.amount = amount;
    order.status = 'started';
    order.items = orderItems;
    order.shippingInfo = shippingInfo;
    return this.save(order);
  }

  async completeOrder(userId: string, orderId: string): Promise<Order> {
    const order = await this.findOne({
      where: {
        id: orderId,
        user: {
          id: userId,
        },
      },
    });
    if (!order) {
      throw new BusinessException(
        'payment',
        'Not-Exist-Order',
        'Not-Exist-Order',
        HttpStatus.BAD_REQUEST,
      );
    }
    order.status = 'paid';

    await Promise.all([
      this.issuedCouponRepository.use(order.usedIssuedCoupon),
      this.pointRepository.use(
        order.user,
        order.pointAmountUsed,
        'Order Successful',
      ),
    ]);
    return this.repo.save(order);
  }
}
