import { Role } from '../enums';
import { SetMetadata } from '@nestjs/common';

export const ROLE_KEY = 'role';
export const Roles = (...role: Role[]) => SetMetadata(ROLE_KEY, role);
