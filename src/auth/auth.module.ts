import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import {
  AccessLogRepository,
  AccessTokenRepository,
  BlackListRepository,
  RefreshTokenRepository,
} from './repositories';
import { UserModule } from 'src/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AccessLog,
  AccessToken,
  BlackListToken,
  RefreshToken,
} from './entities';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { User } from 'src/user/entities';
import { UserService } from 'src/user/service/user.service';
import { JwtStrategy } from './strategies';

@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('ACCESS_TOKEN_EXPIRY'),
        },
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([
      User,
      AccessLog,
      AccessToken,
      BlackListToken,
      RefreshToken,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessLogRepository,
    AccessTokenRepository,
    JwtStrategy,
    BlackListRepository,
    RefreshTokenRepository,
  ],
  exports: [
    AuthService,
    BlackListRepository,
    AccessLogRepository,
    AccessTokenRepository,
    RefreshTokenRepository,
    JwtStrategy,
  ],
})
export class AuthModule {}
