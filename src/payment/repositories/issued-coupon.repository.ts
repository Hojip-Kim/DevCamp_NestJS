import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { IssuedCoupon } from '../entities/issued-coupon.entity';
import { Coupon } from '../entities/coupon.entity';
import { UserRepository } from 'src/user/repositories/user.repository';
import { CouponRepository } from './coupon.repository';
import { BusinessException } from 'src/exception/BusinessException';

@Injectable()
export class IssuedCouponRepository extends Repository<IssuedCoupon> {
  constructor(
    @InjectRepository(IssuedCoupon)
    private readonly repo: Repository<IssuedCoupon>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly userRepository: UserRepository,
    private readonly couponRepository: CouponRepository,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async use(issuedCoupon: IssuedCoupon) {
    issuedCoupon.use();
    return this.repo.save(issuedCoupon);
  }

  // Coupon을  사용자에게 발급해주는 메서드
  async createIssuedCoupon(
    userId: string,
    couponId: string,
    validDate: number,
  ): Promise<IssuedCoupon> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const coupon = await this.couponRepository.findOne({
      where: { id: couponId },
    });
    if (coupon.maxIssue <= coupon.issuedCoupon.length) {
      throw new BusinessException(
        'payment',
        'Exceed maxIssue Coupon',
        'Exceed maxIssue Coupon',
        HttpStatus.BAD_REQUEST,
      );
    }
    const thisDate = new Date();
    const newIssuedCoupon = new IssuedCoupon();
    newIssuedCoupon.user = user;
    newIssuedCoupon.createCouponID(); // 쿠폰 고유번호 generated
    newIssuedCoupon.coupon = coupon;
    newIssuedCoupon.validFrom = thisDate;

    const untilDate = new Date(thisDate);
    untilDate.setDate(thisDate.getDate() + validDate);
    newIssuedCoupon.validUntil = untilDate;
    newIssuedCoupon.isValid = true;

    this.repo.save(newIssuedCoupon);
    return newIssuedCoupon;
  }
}
/*
user: Relation<User>;

  @Column()
  couponID: string; // 쿠폰 고유 식별번호

  @ManyToOne(() => Coupon)
  @JoinColumn()
  coupon: Relation<Coupon>;

  @ManyToOne(() => Order, (order) => order.usedIssuedCoupon, { nullable: true })
  usedOrder: Relation<Order>;

  @Column({ type: 'boolean', default: false })
  isValid: boolean;

  @Column({ type: 'timestamp', nullable: false })
  validFrom: Date;

  @Column({ type: 'timestamp', nullable: false })
  validUntil: Date;

  @Column({ type: 'boolean', default: false })
  isUsed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date;
*/
