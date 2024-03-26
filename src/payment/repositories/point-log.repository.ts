import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from 'src/user/entities';
import { PointLog } from '../entities/point-log.entity';

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

}
