import { Injectable } from '@nestjs/common';
import { Coupon } from '../entities';
import { CreateCouponRequestDto } from '../dto/createCoupon-Request.dto';
import { CouponRepository } from '../repositories';

@Injectable()
export class CouponService {
  constructor(private readonly couponRepository: CouponRepository) {}

  async createCoupon(dto: CreateCouponRequestDto): Promise<Coupon> {
    const { couponType, couponName, value, description, maxIssue } = dto;

    return await this.couponRepository.createCoupon(
      couponType,
      couponName,
      value,
      description,
      maxIssue,
    );
  }
}
