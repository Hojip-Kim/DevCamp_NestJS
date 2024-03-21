import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RefreshToken } from '../entities';
import { User } from 'src/user/entities';

@Injectable()
export class RefreshTokenRepository extends Repository<RefreshToken> {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repo: Repository<RefreshToken>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async saveRefreshToken(
    jti: string,
    user: User,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    const accessToken = new RefreshToken();

    accessToken.jti = jti;
    accessToken.user = user;
    accessToken.accessToken = token;
    accessToken.expiresAt = expiresAt;
    accessToken.isRevoke = false;
    return await this.repo.save(accessToken);
  }

  async findOneByJti(jti: string): Promise<RefreshToken> {
    return this.repo.findOneBy({ jti, isRevoke: false });
  }

}
