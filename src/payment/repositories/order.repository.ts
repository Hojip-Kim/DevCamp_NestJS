import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { ShippingInfo } from '../entities/shipping-info.entity';
import { UserRepository } from 'src/user/repositories/user.repository';

@Injectable()
export class OredrRepository extends Repository<Order> {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly userRepository: UserRepository,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async createOrder(
    userId: string,
    orderItems: OrderItem[],
    amount: number,
    shippingInfo?: ShippingInfo,
  ): Promise<Order> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const order = new Order();
    order.user = user;
    order.amount = amount;
    order.status = 'started';
    order.items = orderItems;
    order.shippingInfo = shippingInfo;
    return this.save(order);
  }
}
