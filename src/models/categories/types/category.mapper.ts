import { Category as PrismaCategory } from '@prisma/client';
import { Category as DomainCategory } from './category.class';
import { MissingRequireFieldsException } from '../../../common/exceptions';
import { getSlug } from 'src/common/utilities/string.util';

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

    const slug =
      domainCategory.slug && domainCategory.slug.trim() !== ''
        ? domainCategory.slug
        : getSlug(domainCategory.name);

    return {
      name: domainCategory.name,
      slug,
      description: domainCategory.description ?? null,
      is_active: domainCategory.isActive ?? true,
      created_at: domainCategory.createdAt ?? new Date(),
      updated_at: domainCategory.updatedAt ?? new Date(),
      ...(domainCategory.id ? { id: domainCategory.id } : {}),
    };
  }
}
