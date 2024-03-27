import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/user/guards/roles.guard';
import { Coupon } from '../entities';
import { Roles } from 'src/decorators/role-decorators';
import { CreateCouponRequestDto } from '../dto/createCoupon-Request.dto';
import { CouponService } from '../service/coupon.service';

@Controller('/coupon')
@UseGuards(RolesGuard)
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('/create')
  @UseGuards(AuthGuard('/access-token'))
  @Roles('admin')
  async createCoupon(
    @Req() req,
    @Body() body: CreateCouponRequestDto,
  ): Promise<Coupon> {
    return await this.couponService.createCoupon(body);
  }
}
