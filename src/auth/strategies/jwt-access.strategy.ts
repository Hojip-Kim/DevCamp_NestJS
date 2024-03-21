import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserService } from 'src/user/service/user.service';
import { TokenPayload } from '../types';
import { User } from 'src/user/entities';
import { AccessTokenRepository, BlackListRepository } from '../repositories';
import { BusinessException } from 'src/exception/BusinessException';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly blacklistRepo: BlackListRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /*
  token이 blackList에 포함된다면 exception error를 터뜨리고 인증이 안되도록.
  */
  async validate(payload: TokenPayload): Promise<User> {
    const { sub, jti } = payload;

    const isBlackListed = await this.blacklistRepo.isBlackListedToken(
      jti,
      'access',
    );
    if (isBlackListed) {
      throw new BusinessException(
        'auth',
        'No-longer-valid-Token',
        'No-longer-valid-Token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.userService.validateUser(sub, jti);
  }
}
