import { User as PrismaUser } from '@prisma/client';
import { User as DomainUser } from './user.class';
import { MissingRequireFieldsException } from '../../../common/exceptions';

export class UserMapper {
  static toDomain(this: void, prismaUser: PrismaUser): DomainUser {
    return new DomainUser(
      prismaUser.id,
      prismaUser.username,
      prismaUser.email,
      prismaUser.phone,
      prismaUser.password_hash,
      prismaUser.full_name,
      prismaUser.role,
      prismaUser.is_active,
      prismaUser.is_deleted,
      prismaUser.reset_code,
      prismaUser.reset_code_exp,
      prismaUser.reset_token,
      prismaUser.reset_token_exp,
      prismaUser.refresh_token_hash,
      prismaUser.created_at,
      prismaUser.updated_at,
      prismaUser.deleted_at,
    );
  }

  static toPrisma(domainUser: DomainUser) {
    // Validate required fields
    if (
      !domainUser.username ||
      !domainUser.email ||
      !domainUser.passwordHash ||
      !domainUser.fullName ||
      !domainUser.role
    ) {
      throw new MissingRequireFieldsException();
    }
    return {
      username: domainUser.username,
      email: domainUser.email,
      phone: domainUser.phone ?? null,
      password_hash: domainUser.passwordHash,
      full_name: domainUser.fullName,
      role: domainUser.role,
      is_active: domainUser.isActive,
      is_deleted: domainUser.isDeleted,
      reset_code: domainUser.resetCode ?? null,
      reset_code_exp: domainUser.resetCodeExp ?? null,
      reset_token: domainUser.resetToken ?? null,
      reset_token_exp: domainUser.resetTokenExp ?? null,
      refresh_token_hash: domainUser.refreshTokenHash ?? null,
      created_at: domainUser.createdAt ?? new Date(),
      updated_at: domainUser.updatedAt ?? new Date(),
      deleted_at: domainUser.deletedAt,
      ...(domainUser.id ? { id: domainUser.id } : {}),
    };
  }
}
