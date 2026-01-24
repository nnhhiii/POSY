import { ApiProperty } from '@nestjs/swagger';

/**
 * Generic paginated response DTO for API endpoints. Use this to document paginated responses in Swagger.
 */
export class PageResponseDto<T> {
  @ApiProperty({
    description: 'Array of items for the current page',
    isArray: true,
  })
  items: T[];

  @ApiProperty({
    type: Number,
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  pageSize: number;

  @ApiProperty({
    type: Number,
    description: 'Total number of items',
    example: 100,
  })
  total: number;

  @ApiProperty({
    type: Number,
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;
}

/**
 * Helper function to create a paginated response schema for Swagger.
 * Use this when you need to specify the type of items in the schema.
 *
 * @param itemType - The DTO class for the items in the page
 * @returns Swagger schema object for paginated response
 *
 * @example
 * /@ApiResponse/({
 *   status: 200,
 *   description: 'Paginated list of products',
 *   schema: createPageResponseSchema(ProductPreviewResponseDto),
 * })
 */
export function createPageResponseSchema(itemType: any) {
  return {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        items: { $ref: `#/components/schemas/${itemType.name}` },
      },
      page: { type: 'number', example: 1 },
      pageSize: { type: 'number', example: 10 },
      total: { type: 'number', example: 100 },
      totalPages: { type: 'number', example: 10 },
    },
  };
}
