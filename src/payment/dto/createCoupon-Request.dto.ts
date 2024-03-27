import { CouponType } from '../entities';

export class CreateCouponRequestDto {
    couponType: CouponType;
    couponName: string;
    description?: string;
    value: number;
    maxIssue? : number;
}