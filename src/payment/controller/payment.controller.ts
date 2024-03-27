import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateOrderResponseDto } from '../dto/createOrder-Response.dto';
import { PaymentService } from '../service/payment.service';
import { CreateOrderRequestDto } from '../dto/createOrder-Request.dto';
import { Order } from '../entities';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // order
  @Post('/order')
  @UseGuards(AuthGuard('access-token')) // sub : userId
  async createOrder(
    @Req() req,
    @Body() body: CreateOrderRequestDto,
  ): Promise<CreateOrderResponseDto> {
    const { userId } = req.user;

    const order = await this.paymentService.initOrder(userId, body);

    return {
      orderItems: order.items,
      couponId: order.usedIssuedCoupon.coupon.id,
      issuedCouponId: order.usedIssuedCoupon.id,
      pointAmountToUse: order.pointAmountUsed,
      shippingAddress: order.shippingInfo.address,
      totalAmount: order.amount,
    };
  }

  @Post('/paid')
  @UseGuards(AuthGuard('access-token'))
  async completeOrder(@Req() req, @Body() body): Promise<Order> {
    const { userId } = req.user;
    const { orderId } = body;

    return await this.paymentService.completeOrder(userId, orderId);
  }
}
