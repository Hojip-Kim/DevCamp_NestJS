import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateOrderResponseDto } from '../dto/createOrder-Response.dto';
import { PaymentService } from '../service/payment.service';
import { CreateOrderRequestDto } from '../dto/createOrder-Request.dto';
import { Order } from '../entities';
import { TossDto } from '../dto/tossPayment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /* 
  order
  결제창으로 넘어갈 때 이 라우터가 실행됩니다.

  */
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

  /*
  payment가 정상적으로 success처리 되었을 경우 Order의 status가 'paid'로 바뀌고,
   포인트 및 쿠폰 사용처리 완료됨.
   */
  @Get('/success')
  async completeOrder(@Query() query: TossDto): Promise<TossDto> {
    const responseTossDto = await this.paymentService.tossPayment(query);
    return responseTossDto;
  }

  @Post('/fail')
  failOrder() {
    return { response: '실패' };
  }
}
