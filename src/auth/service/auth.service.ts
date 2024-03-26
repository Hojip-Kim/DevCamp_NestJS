import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as argon2 from 'argon2';
import { LoginResponseDto } from '../dto/login-response.dto';
import { UserService } from 'src/user/service/user.service';
import {
  AccessLogRepository,
  AccessTokenRepository,
  BlackListRepository,
  RefreshTokenRepository,
} from '../repositories';
import { User } from 'src/user/entities';
import { UserRepository } from 'src/user/repositories/user.repository';
import { BusinessException } from 'src/exception/BusinessException';
import { RequestInfo, TokenPayload } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from '../entities';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly accessTokenRepository: AccessTokenRepository,
    private readonly accessLogRepository: AccessLogRepository,
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly blacklistRepository: BlackListRepository,
  ) {}

  /*

  */
  async login(
    email: string,
    password: string,
    req: RequestInfo,
  ): Promise<LoginResponseDto> {
    const user = await this.validateUser(email, password);
    const payload: TokenPayload = this.createTokenPayload(user.id);

    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(user, payload),
      this.createRefreshToken(user, payload),
    ]);

    const { ip, endpoint, ua } = req;
    await this.accessLogRepository.createAccessLog(user, ip, endpoint, ua);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        userName: user.userName,
        userEmail: user.userEmail,
      },
    };
  }

  async logout(accessToken: string, refreshToken: string): Promise<void> {
    const [jtiAccess, jtiRefresh] = await Promise.all([
      this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }),
      this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }),
    ]);

    await Promise.all([
      this.addToBlacklist(
        accessToken,
        jtiAccess,
        'access',
        'ACCESS_TOKEN_EXPIRY',
      ),
      this.addToBlacklist(
        refreshToken,
        jtiRefresh,
        'refresh',
        'REFRESH_TOKEN_EXPIRY',
      ),
    ]);
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const { exp, ...payload } = await this.jwtService.verifyAsync(
        refreshToken,
        { secret: this.configService.get<string>('JWT_SECRET') },
      );

      const user = await this.userRepository.findOneBy({ id: payload.sub });
      if (!user) {
        throw new BusinessException(
          'user',
          'user-not-found',
          'user-not-found',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return this.createAccessToken(user, payload as TokenPayload);
    } catch (error) {
      throw new BusinessException(
        'auth',
        'Invalid-refresh-token',
        'Invalid-refresh-token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async addToBlacklist(
    token: string,
    jti: string,
    type: 'access' | 'refresh',
    expiryConfigKey: string,
  ): Promise<void> {
    const expiryTime = this.calculateExpiry(
      this.configService.get<string>(expiryConfigKey),
    );

    await this.blacklistRepository.addToBlackList(token, jti, type, expiryTime);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findUserByEmail(email);

    if (user && (await argon2.verify(user.passWord, password))) {
      return user;
    } else {
      throw new BusinessException(
        'user',
        'Invalid password or email',
        'Invalid password or email',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  createTokenPayload(userId: string): TokenPayload {
    return {
      sub: userId,
      iat: Math.floor(Date.now() / 1000), // 토큰 발급 시간
      jti: uuidv4(),
    };
  }

  async createAccessToken(user: User, payload: TokenPayload): Promise<string> {
    const expiresIn = this.configService.get<string>('ACCESS_TOKEN_EXPIRY');
    const token = this.jwtService.sign(payload, { expiresIn });
    const expiresAt = this.calculateExpiry(expiresIn);

    await this.accessTokenRepository.saveAccessToken(
      payload.jti,
      user,
      token,
      expiresAt,
    );

    return token;
  }
  async createRefreshToken(user: User, payload: TokenPayload): Promise<string> {
    const expiresIn = this.configService.get<string>('REFRESH_TOKEN_EXPIRY');
    const token = this.jwtService.sign(payload, { expiresIn });
    const expiresAt = this.calculateExpiry(expiresIn);

    await this.refreshTokenRepository.saveRefreshToken(
      payload.jti,
      user,
      token,
      expiresAt,
    );

    return token;
  }

  calculateExpiry(expiry: string): Date {
    let expiresInMilliseconds = 0;

    const time = parseInt(expiry.slice(0, -1), 10);
    const unit = expiry.slice(-1);

    switch (unit) {
      case 'd':
        expiresInMilliseconds = time * 24 * 60 * 60 * 1000;
        break;
      case 'h':
        expiresInMilliseconds = time * 60 * 60 * 1000;
        break;
      case 'm':
        expiresInMilliseconds = time * 60 * 1000;
        break;
      case 's':
        expiresInMilliseconds = time * 1000;
        break;
      default:
        throw new BusinessException(
          'auth',
          'invalid-expiry',
          'Invalid expiry time',
          HttpStatus.BAD_REQUEST,
        );
    }

    return new Date(Date.now() + expiresInMilliseconds);
  }
}
