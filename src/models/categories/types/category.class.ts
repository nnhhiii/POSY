import { getSlug } from '../../../common/utilities/string.util';

export class Category {
  constructor(
    public id: string | null,
    public name: string,
    public slug: string = '',
    public description: string | null,
    public isActive: boolean,
    public createdAt: Date | null,
    public updatedAt: Date | null,
  ) {
    // Auto-generate slug if not provided
    if (slug.trim() === '') {
      this.slug = getSlug(name);
    }
  }
}
