import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Point } from '../entities/point.entity';
import { PointLogRepository } from './point-log.repository';
import { User } from 'src/user/entities';

@Injectable()
export class PointRepository extends Repository<Point> {
  constructor(
    @InjectRepository(Point)
    private readonly repo: Repository<Point>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly pointLogRepository: PointLogRepository,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async use(user: User, amountToUse: number, reason?: string): Promise<Point> {
    const point = user.point;
    point.use(amountToUse);
    await this.pointLogRepository.use(point, amountToUse, reason);
    return this.save(point);
  }

  async add(user: User, amountToAdd: number, reason?: string): Promise<Point> {
    const point = user.point;
    point.add(amountToAdd);
    await this.pointLogRepository.add(point, amountToAdd, reason);
    return this.save(point);
  }
}
