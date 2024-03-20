import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto, ResponseUserDto } from '../dto/index';

import * as argon2 from 'argon2';
import { User } from '../entities/user.entity';
import { BusinessException } from 'src/exception/BusinessException';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(dto: CreateUserDto): Promise<ResponseUserDto> {
    const { userName, userEmail, passWord, role } = dto;

    const user = this.userRepository.findUserByEmail(userEmail);

    if (user != null) {
      throw new BusinessException(
        'user',
        `${dto.userEmail} already exist`,
        `${dto.userEmail} already exist`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await argon2.hash(passWord);

    const createdUser = await this.userRepository.createUser(
      dto,
      hashedPassword,
    );

    const response = this.mapUserToResponseUserDto(createdUser);

    return response;
  }

  async mapUserToResponseUserDto(user: User): Promise<ResponseUserDto> {
    const dto = new ResponseUserDto();
    dto.userName = user.userName;
    dto.userEmail = user.userEmail;
    if (Array.isArray(user.role)) {
      dto.role = user.role[0]?.role; // 첫 번째 역할을 사용
    } else {
      dto.role = user.role?.role;

      return dto;
    }
  }
}
