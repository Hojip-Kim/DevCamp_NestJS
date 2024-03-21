import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BlackListToken } from '../entities';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BlackListRepository extends Repository<BlackListToken> {
  constructor(
    @InjectRepository(BlackListToken)
    private readonly repo: Repository<BlackListToken>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async addToBlackList(
    token: string,
    jti: string,
    type: 'access' | 'refresh',
    expiresAt: Date,
  ): Promise<void> {
    const blacklistToken = new BlackListToken();
    blacklistToken.token = token;
    blacklistToken.jti = jti;
    blacklistToken.tokenType = type;
    blacklistToken.expiresAt = expiresAt;

    await this.repo.save(blacklistToken);
  }

  async isBlackListedToken(
    jti: string,
    type: 'access' | 'refresh',
  ): Promise<boolean> {
    const foundToken = await this.repo.findOneBy({
      jti,
      tokenType: type,
    });

    if (!foundToken) {
      return false;
    }

    return true;
  }
}
/*
await Promise.all([
      this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }),*/
