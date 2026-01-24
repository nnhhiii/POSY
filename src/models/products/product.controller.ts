import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { Roles } from '../../common/decorators';
import { Role } from '../../common/enums';
import {
  CreateProductDto,
  ProductDetailedResponseDto,
  ProductPreviewResponseDto,
  ProductQueryParamsDto,
  UpdateProductDto,
} from './dto';
import { Product } from './types';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  DuplicateEntryException,
  ForeignKeyViolationException,
} from '../../common/exceptions';
import { plainToInstance } from 'class-transformer';
import { CreateProductService } from './create-product/create-product.service';
import { UpdateProductService } from './update-product/update-product.service';
import { GetProductsService } from './get-products/get-products.service';
import { DeleteProductService } from './delete-product/delete-product.service';
import { createPageResponseSchema } from '../../common/dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductNotFoundException } from './exceptions';
import { JwtPayload } from '../../authentication/interfaces';

@ApiTags('Product')
@ApiBearerAuth()
@Controller('product')
export class ProductController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(
    private readonly getProductsService: GetProductsService,
    private readonly createProductService: CreateProductService,
    private readonly updateProductService: UpdateProductService,
    private readonly deleteProductService: DeleteProductService,
  ) {}

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get all products',
    description: `Returns a paginated list of all products. Accessible by all authenticated users. 
    Non-admin users can only see non-deleted products. Admin users can see all products including 
    deleted ones by setting isDeleted filter. Supports filtering by query parameters such as price, 
    category, discount type, stock, etc. Used for listing and searching products.`,
  })
  @ApiQuery({ name: 'query', required: false, type: ProductQueryParamsDto })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of products',
    schema: createPageResponseSchema(ProductPreviewResponseDto),
  })
  async getAll(@Query() query: ProductQueryParamsDto, @Req() req: Request) {
    try {
      const role = (req.user as JwtPayload).role;
      const queryParams = query.toQueryParams();

      // Non-admin users cannot see deleted products
      if (
        role !== Role.ADMIN.toString() &&
        queryParams.filter?.isDeleted !== false
      ) {
        // Force isDeleted to false for non-admin users
        if (!queryParams.filter) queryParams.filter = {};
        queryParams.filter.isDeleted = false;
      }

      const products = await this.getProductsService.getAll(queryParams);
      const items = plainToInstance(ProductPreviewResponseDto, products.items, {
        excludeExtraneousValues: true,
      });
      return { ...products, items };
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get product by ID',
    description: `Fetches detailed information for a specific product by its unique ID. Accessible by 
    all authenticated users. Non-admin users cannot access deleted products. Returns 400 if the product
    is not found or if a non-admin user tries to access a deleted product.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    type: ProductDetailedResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Product not found' })
  async getById(@Param('id') id: string, @Req() req: Request) {
    try {
      const userRole = (req.user as JwtPayload).role;
      const product = await this.getProductsService.getById(id);

      // Non-admin users cannot access deleted products
      if (userRole !== Role.ADMIN.toString() && product.isDeleted) {
        // noinspection ExceptionCaughtLocallyJS
        throw new ProductNotFoundException(id);
      }

      return plainToInstance(ProductDetailedResponseDto, product, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof ProductNotFoundException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post('')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Create a new product',
    description: `Creates a new product with the provided details. Only accessible by 
    ADMIN role. Returns the created product preview. Throws 400 for duplicate entries.`,
  })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Product created',
    type: ProductPreviewResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Duplicate entry' })
  async create(@Body() dto: CreateProductDto) {
    try {
      const product = await this.createProductService.create(
        dto as unknown as Product,
      );
      return plainToInstance(ProductPreviewResponseDto, product, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof DuplicateEntryException) {
        throw new BadRequestException(e.message);
      } else if (e instanceof ForeignKeyViolationException) {
        const message = {
          message: e.message,
          details: e.details,
        };
        throw new BadRequestException(message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Update a product',
    description: `Updates an existing product by its ID. Only accessible by ADMIN role. 
    Returns the updated product preview. Throws 400 for not found or duplicate entries.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'Product updated',
    type: ProductPreviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Product not found or duplicate entry',
  })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    try {
      const product = await this.updateProductService.update(
        id,
        dto as unknown as Partial<Product>,
      );
      return plainToInstance(ProductPreviewResponseDto, product, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof ProductNotFoundException) {
        throw new BadRequestException(e.message);
      } else if (e instanceof DuplicateEntryException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Delete a product',
    description: `Deletes a product by its ID. Only accessible by ADMIN role. 
    Returns a success message. Throws 400 if the product is not found.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 400, description: 'Product not found' })
  async delete(@Param('id') id: string) {
    try {
      await this.deleteProductService.delete(id);
      return { message: 'Product deleted successfully.' };
    } catch (e) {
      if (e instanceof ProductNotFoundException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}
