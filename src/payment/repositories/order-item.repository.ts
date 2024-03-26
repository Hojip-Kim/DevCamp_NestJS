import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { OrderItem } from '../entities/order-item.entity';

@Injectable()
export class OrderItemRepository extends Repository<OrderItem> {
  constructor(
    @InjectRepository(OrderItem)
    private readonly repo: Repository<OrderItem>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }
}
