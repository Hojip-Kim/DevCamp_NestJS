import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AccessToken } from '../entities';
import { User } from 'src/user/entities';

@Injectable()
export class AccessTokenRepository extends Repository<AccessToken> {
  constructor(
    @InjectRepository(AccessToken)
    private readonly repo: Repository<AccessToken>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async saveAccessToken(
    jti: string,
    user: User,
    token: string,
    expiresAt: Date,
  ): Promise<AccessToken> {
    const accessToken = new AccessToken();

    accessToken.jti = jti;
    accessToken.user = user;
    accessToken.accessToken = token;
    accessToken.expiresAt = expiresAt;
    accessToken.isRevoke = false;
    return await this.repo.save(accessToken);
  }

  async findOneByJti(jti: string): Promise<AccessToken> {
    return this.repo.findOneBy({ jti, isRevoke: false });
  }
}
