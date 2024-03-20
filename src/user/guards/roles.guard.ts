import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleRepository } from '../repositories/user-role.repository';
import { ROLES_KEYS } from 'src/decorators/role-decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userRoleRepository: UserRoleRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEYS,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const userId = user.id;

    // 사용자의 역할 조회
    const userRoles = await this.userRoleRepository.find({
      where: { id: userId },
    });

    // 사용자의 역할이 필요한 역할 중 하나라도 포함되어 있는지 확인
    const hasRole = userRoles.some((role) => requiredRoles.includes(role.role));

    return hasRole;
  }
}
