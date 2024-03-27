import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from 'src/user/entities';
import { PointLog } from '../entities/point-log.entity';
import { Point } from '../entities';

@Injectable()
export class PointLogRepository extends Repository<PointLog> {
  constructor(
    @InjectRepository(PointLog)
    private readonly repo: Repository<PointLog>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  use(point: Point, amountToUse: number, reason: string): Promise<PointLog> {
    const pointLog = new PointLog();
    pointLog.point = point;
    pointLog.use(amountToUse, reason);
    return this.save(pointLog);
  }

  add(point: Point, amountToAdd: number, reason: string): Promise<PointLog> {
    const pointLog = new PointLog();
    pointLog.point = point;
    pointLog.add(amountToAdd, reason);
    return this.save(pointLog);
  }
}
