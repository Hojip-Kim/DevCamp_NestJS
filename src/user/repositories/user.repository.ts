import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserRole } from '../entities/user-role.entity';
import { UserRoleRepository } from './user-role.repository';
import { BusinessException } from 'src/exception/BusinessException';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly roleRepo: UserRoleRepository,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.repo.findOneBy({ userEmail: email });
    if (user != null) {
      return user;
    } else {
      throw new BusinessException(
        'user',
        'cant find user',
        'cant find user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createUser(dto: CreateUserDto, hashedPassword: string): Promise<User> {
    const user = new User();
    const { userName, userEmail, role } = dto;
    user.userName = userName;
    user.userEmail = userEmail;
    user.passWord = hashedPassword;

    const userRole = new UserRole();

    userRole.role = role;

    userRole.user = user;

    await this.roleRepo.save(userRole);

    await this.repo.save(user);

    return user;
  }
}
