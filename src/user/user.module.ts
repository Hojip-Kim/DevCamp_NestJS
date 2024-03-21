import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { UserRepository } from './repositories/user.repository';
import { UserRoleRepository } from './repositories/user-role.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([User, UserRole]),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserRoleRepository],
  exports: [UserService, UserRepository, UserRoleRepository],
})
export class UserModule {}
