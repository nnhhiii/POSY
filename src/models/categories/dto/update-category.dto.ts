import { IsValidCategoryDescription, IsValidCategoryName } from '../decorators';
import { IsValidSlug } from '../../../common/decorators';
import { IsOptional } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsValidCategoryName()
  name?: string;

  @IsOptional()
  @IsValidCategoryDescription()
  description?: string;

  // @IsOptional()
  // @IsValidSlug()
  // slug?: string;
}
