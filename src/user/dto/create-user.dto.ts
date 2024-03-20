import { Role } from '../entities/user-role.entity';

export class CreateUserDto {
  userName: string;
  userEmail: string;
  passWord: string;
  role: Role;
}
