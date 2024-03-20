import { SetMetadata } from '@nestjs/common';

/*
Controller에 @SetMetadata('roles', [Role.admin])와 같은 방식으로 설정할 수 있지만, 
권장되는 방법이 아니므로, 고유한 데코레이터를 만듦.

Custom Metadata
key : roles
value : Role.admin
*/
export const ROLES_KEYS = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEYS, roles);
