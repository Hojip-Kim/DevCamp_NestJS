import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Coupon, CouponType } from '../entities/coupon.entity';

@Injectable()
export class CouponRepository extends Repository<Coupon> {
  constructor(
    @InjectRepository(Coupon)
    private readonly repo: Repository<Coupon>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }
  //
  async createCoupon(
    couponType: CouponType,
    name: string,
    value: number,
    description?: string,
    maxIssue?: number,
  ): Promise<Coupon> {
    const newCoupon = new Coupon();
    newCoupon.couponType = couponType;
    newCoupon.couponName = name;
    newCoupon.description = description;
    newCoupon.value = value;
    if (maxIssue != null) {
      newCoupon.maxIssue = maxIssue;
    }
    this.repo.save(newCoupon);
    return newCoupon;
  }
}
