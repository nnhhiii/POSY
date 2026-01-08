import { Category as PrismaCategory } from '@prisma/client';
import { Category as DomainCategory } from './category.class';
import { MissingRequireFieldsException } from '../../../common/exceptions';

export class CategoryMapper {
  static toDomain(this: void, prismaCategory: PrismaCategory): DomainCategory {
    return new DomainCategory(
      prismaCategory.id,
      prismaCategory.name,
      prismaCategory.slug,
      prismaCategory.description,
      prismaCategory.is_active,
      prismaCategory.created_at,
      prismaCategory.updated_at,
    );
  }

  static toPrisma(this: void, domainCategory: DomainCategory) {
    if (!domainCategory.name) {
      throw new MissingRequireFieldsException();
    }
    return {
      name: domainCategory.name,
      slug: domainCategory.slug,
      description: domainCategory.description ?? null,
      is_active: domainCategory.isActive ?? true,
      created_at: domainCategory.createdAt ?? new Date(),
      updated_at: domainCategory.updatedAt ?? new Date(),
      ...(domainCategory.id ? { id: domainCategory.id } : {}),
    };
  }
}
