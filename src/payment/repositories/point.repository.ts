import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Point } from '../entities/point.entity';

@Injectable()
export class PointRepository extends Repository<Point> {
  constructor(
    @InjectRepository(Point)
    private readonly repo: Repository<Point>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }
}
