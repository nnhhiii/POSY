import { Transform } from 'class-transformer';
import { IsOptional, IsBoolean, IsNumber, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserOrderBy, UserQueryParams, UserSortField } from '../interfaces';
import { SortDirection } from '../../../common/interfaces';
import { Role } from '../../../common/enums';

export class UserQueryParamsDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Search query for user full name, email, or username',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by user role',
    example: 'STAFF',
    enum: Role,
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filter by deleted status',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isDeleted?: boolean;

  @ApiPropertyOptional({ type: Number, description: 'Page number', example: 1 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string))
  page?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Page size',
    example: 20,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string))
  pageSize?: number;

  @ApiPropertyOptional({
    type: String,
    description: `Order by fields in format: field:direction,field:direction.`,
    example: 'fullName:asc,createdAt:desc',
    enum: ['fullName', 'email', 'username', 'role', 'createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  toQueryParams(): UserQueryParams {
    const { page, pageSize, query, role, isActive, isDeleted, orderBy } = this;

    // Parse orderBy string into UserOrderBy array
    let parsedOrderBy: UserOrderBy | undefined;
    if (orderBy) {
      parsedOrderBy = orderBy.split(',').map((item) => {
        const [field, direction] = item.split(':');
        return {
          field: field as UserSortField,
          direction: direction as SortDirection,
        };
      });
    }

    return {
      page,
      pageSize,
      orderBy: parsedOrderBy,
      filter: {
        query,
        role,
        isActive,
        isDeleted,
      },
    };
  }
}
