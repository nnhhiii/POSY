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
import { CreatePromotionService } from './create-promotion/create-promotion.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { Roles } from '../../common/decorators';
import { Role } from '../../common/enums';
import {
  CreatePromotionDto,
  PromotionCategoryDetailedResponseDto,
  PromotionCategoryPreviewResponseDto,
  PromotionDetailedResponseDto,
  PromotionPreviewResponseDto,
  PromotionQueryParamsDto,
  PromotionUpdateDto,
} from './dto';
import { Promotion, PromotionCategory, PromotionProduct } from './types';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { DuplicateEntryException } from '../../common/exceptions';
import { plainToInstance } from 'class-transformer';
import { UpdatePromotionService } from './update-promotion/update-promotion.service';
import {
  PromotionCategoryNotFoundException,
  PromotionNotFoundException,
  PromotionProductNotFoundException,
} from './exceptions';
import { GetPromotionsService } from './get-promotions/get-promotions.service';
import { DeletePromotionService } from './delete-promotion/delete-promotion.service';
import { ValidatePromotionService } from './validate-promotion/validate-promotion.service';
import { PromotionUnusableException } from './exceptions/PromotionUnusableException';
import { CategoryNotFoundException } from '../categories/exceptions';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { PromotionProductPreviewResponseDto } from './dto/promotion-product-preview-response.dto';
import { Request } from 'express';
import { JwtPayload } from '../../authentication/interfaces';
import { ProductNotFoundException } from '../products/exceptions';
import { createPageResponseSchema } from '../../common/dto';

@ApiTags('Promotion')
@ApiBearerAuth()
@Controller('promotion')
export class PromotionController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(
    private readonly getPromotionsService: GetPromotionsService,
    private readonly createPromotionService: CreatePromotionService,
    private readonly updatePromotionService: UpdatePromotionService,
    private readonly deletePromotionService: DeletePromotionService,
    private readonly validatePromotionService: ValidatePromotionService,
  ) {}

  @Get('/category')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Get all promotion categories',
    description: `Returns a list of all promotion categories in the system. 
    Accessible only by ADMIN and MANAGER roles. 
    Used for management and assignment of promotions to categories.`,
  })
  @ApiResponse({
    status: 200,
    description: 'List of promotion categories',
    type: [PromotionCategoryPreviewResponseDto],
  })
  async getPromotionCategories() {
    try {
      const promotionCategories =
        await this.getPromotionsService.getPromotionCategories();
      return plainToInstance(
        PromotionCategoryPreviewResponseDto,
        promotionCategories,
        {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        },
      );
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Get('/product')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Get all promotion products',
    description: `Returns a list of all products that have promotions assigned. 
    Accessible only by ADMIN and MANAGER roles. Useful for managing product-level promotions.`,
  })
  @ApiResponse({
    status: 200,
    description: 'List of promotion products',
    type: [PromotionProductPreviewResponseDto],
  })
  async getPromotionProducts() {
    try {
      const promotionProducts =
        await this.getPromotionsService.getPromotionProducts();
      return plainToInstance(
        PromotionProductPreviewResponseDto,
        promotionProducts,
        {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        },
      );
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Get('applicable/:productId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get applicable promotions for a product' })
  @ApiParam({ name: 'productId', type: String })
  @ApiResponse({
    status: 200,
    description: 'List of applicable promotions',
    type: [PromotionPreviewResponseDto],
  })
  async getApplicablePromotions(@Param('productId') productId: string) {
    try {
      const promotions =
        await this.getPromotionsService.getApplicablePromotionsForProduct(
          productId,
        );
      return plainToInstance(PromotionPreviewResponseDto, promotions, {
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

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get all promotions',
    description: `Returns a paginated list of all promotions. 
    Accessible by all authenticated users. 
    Supports filtering by query parameters such as status, type, applicability, etc. 
    Used for listing and searching promotions.`,
  })
  @ApiQuery({ name: 'query', required: false, type: PromotionQueryParamsDto })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of promotions',
    schema: createPageResponseSchema(PromotionPreviewResponseDto),
  })
  async getAll(@Query() query: PromotionQueryParamsDto) {
    try {
      const promotions = await this.getPromotionsService.getAll(
        query.toQueryParams(),
      );
      const items = plainToInstance(
        PromotionPreviewResponseDto,
        promotions.items,
        {
          excludeExtraneousValues: true,
        },
      );
      return { ...promotions, items };
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
    summary: 'Get promotion by ID',
    description: `Fetches detailed information for a specific promotion by its unique ID. 
    Accessible by all authenticated users. Returns 400 if the promotion is not found.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Promotion details',
    type: PromotionDetailedResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Promotion not found' })
  async getById(@Param('id') id: string) {
    try {
      const promotion = await this.getPromotionsService.getById(id);
      return plainToInstance(PromotionDetailedResponseDto, promotion, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof PromotionNotFoundException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Get(':code')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get promotion by code',
    description: `Fetches detailed information for a specific promotion by its unique code. 
    Accessible by all authenticated users. Returns 400 if the promotion is not found.`,
  })
  @ApiParam({ name: 'code', type: String })
  @ApiResponse({
    status: 200,
    description: 'Promotion details',
    type: PromotionDetailedResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Promotion not found' })
  async getByCode(@Param('code') code: string) {
    try {
      const promotion = await this.getPromotionsService.getByCode(code);
      return plainToInstance(PromotionDetailedResponseDto, promotion, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof PromotionNotFoundException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Get('/category/:id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Get promotion category by ID',
    description: `Fetches details for a specific promotion-category relationship by its ID. 
    Only accessible by ADMIN and MANAGER roles. Returns 400 if not found.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Promotion category details',
    type: PromotionCategoryDetailedResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Promotion category not found' })
  async getPromotionCategoryById(@Param('id') id: string) {
    try {
      const promotionCategory =
        await this.getPromotionsService.getPromotionCategoryById(id);
      return plainToInstance(
        PromotionCategoryDetailedResponseDto,
        promotionCategory,
        {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        },
      );
    } catch (e) {
      if (e instanceof PromotionCategoryNotFoundException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Get('/product/:id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Get promotion product by ID',
    description: `Fetches details for a specific promotion-product relationship by its ID. 
    Only accessible by ADMIN and MANAGER roles. Returns 400 if not found.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Promotion product details',
    type: PromotionProductPreviewResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Promotion product not found' })
  async getPromotionProductById(@Param('id') id: string) {
    try {
      const promotionProduct =
        await this.getPromotionsService.getPromotionProductById(id);
      return plainToInstance(
        PromotionProductPreviewResponseDto,
        promotionProduct,
        {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        },
      );
    } catch (e) {
      if (e instanceof PromotionProductNotFoundException) {
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
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Create a new promotion',
    description: `Creates a new promotion with the provided details. 
    Only accessible by ADMIN and MANAGER roles. Returns the created promotion preview. 
    Throws 400 for duplicate entries.`,
  })
  @ApiBody({ type: CreatePromotionDto })
  @ApiResponse({
    status: 201,
    description: 'Promotion created',
    type: PromotionPreviewResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Duplicate entry' })
  async create(@Body() dto: CreatePromotionDto) {
    try {
      const promotion = await this.createPromotionService.create(
        dto as unknown as Promotion,
      );
      return plainToInstance(PromotionPreviewResponseDto, promotion, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof DuplicateEntryException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post(':id/category')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Add a category to a promotion',
    description: `Associates a category with a promotion. 
    Only accessible by ADMIN and MANAGER roles. 
    Returns the created promotion-category relationship. 
    Throws 400 for invalid promotion/category or duplicates.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ schema: { properties: { categoryId: { type: 'string' } } } })
  @ApiResponse({
    status: 201,
    description: 'Promotion category created',
    type: PromotionCategoryPreviewResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createPromotionCategory(
    @Param('id') promotionId: string,
    @Body() body: { categoryId: string },
  ) {
    try {
      const { categoryId } = body;
      const promotionCategory =
        await this.createPromotionService.createPromotionCategory({
          promotionId,
          categoryId,
        } as PromotionCategory);
      return plainToInstance(
        PromotionCategoryPreviewResponseDto,
        promotionCategory,
        {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        },
      );
    } catch (e) {
      if (
        e instanceof PromotionNotFoundException ||
        e instanceof DuplicateEntryException ||
        e instanceof PromotionUnusableException ||
        e instanceof CategoryNotFoundException
      ) {
        const response: any = { message: e.message };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if ((e as any).meta) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
          response.meta = (e as any).meta;
        }
        throw new BadRequestException(response);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post(':id/product')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Add a product to a promotion',
    description: `Associates a product with a promotion. 
    Only accessible by ADMIN and MANAGER roles. 
    Returns the created promotion-product relationship. 
    Throws 400 for invalid promotion/product or duplicates.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ schema: { properties: { productId: { type: 'string' } } } })
  @ApiResponse({
    status: 201,
    description: 'Promotion product created',
    type: PromotionProductPreviewResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createPromotionProduct(
    @Param('id') promotionId: string,
    @Body() body: { productId: string },
  ) {
    try {
      const { productId } = body;
      const promotionProduct =
        await this.createPromotionService.createPromotionProduct({
          promotionId,
          productId,
        } as PromotionProduct);
      return plainToInstance(
        PromotionProductPreviewResponseDto,
        promotionProduct,
        {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        },
      );
    } catch (e) {
      if (
        e instanceof PromotionNotFoundException ||
        e instanceof DuplicateEntryException ||
        e instanceof PromotionUnusableException
      ) {
        const response: any = { message: e.message };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if ((e as any).meta) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
          response.meta = (e as any).meta;
        }
        throw new BadRequestException(response);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Update a promotion',
    description: `Updates an existing promotion by its ID. 
    Only accessible by ADMIN and MANAGER roles. 
    Returns the updated promotion preview. 
    Throws 400 for not found or duplicate entries.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: PromotionUpdateDto })
  @ApiResponse({
    status: 200,
    description: 'Promotion updated',
    type: PromotionPreviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Promotion not found or duplicate entry',
  })
  async update(@Param('id') id: string, @Body() dto: PromotionUpdateDto) {
    try {
      const promotion = await this.updatePromotionService.update(id, dto);
      return plainToInstance(PromotionPreviewResponseDto, promotion, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof PromotionNotFoundException) {
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
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Delete a promotion',
    description: `Deletes a promotion by its ID. 
    Only accessible by ADMIN and MANAGER roles. 
    Returns a success message. Throws 400 if the promotion is not found.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Promotion deleted' })
  @ApiResponse({ status: 400, description: 'Promotion not found' })
  async delete(@Param('id') id: string) {
    try {
      await this.deletePromotionService.delete(id);
      return { message: 'Promotion deleted successfully.' };
    } catch (e) {
      if (e instanceof PromotionNotFoundException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Delete('category/:id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Delete a promotion category',
    description: `Deletes a promotion-category relationship by its ID. 
    Only accessible by ADMIN and MANAGER roles. 
    Returns a success message. Throws 400 if not found.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Promotion category deleted' })
  @ApiResponse({ status: 400, description: 'Promotion category not found' })
  async deletePromotionCategory(@Param('id') id: string) {
    try {
      await this.deletePromotionService.deletePromotionCategory(id);
      return { message: 'Promotion category deleted successfully.' };
    } catch (e) {
      if (e instanceof PromotionCategoryNotFoundException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Delete('product/:id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Delete a promotion product',
    description: `Deletes a promotion-product relationship by its ID. 
    Only accessible by ADMIN and MANAGER roles. 
    Returns a success message. Throws 400 if not found.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Promotion product deleted' })
  @ApiResponse({ status: 400, description: 'Promotion product not found' })
  async deletePromotionProduct(@Param('id') id: string) {
    try {
      await this.deletePromotionService.deletePromotionProduct(id);
      return { message: 'Promotion product deleted successfully.' };
    } catch (e) {
      if (e instanceof PromotionProductNotFoundException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Get('by-product/:productId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get promotions by product ID',
    description: `Returns all promotions for a specific product. 
    For STAFF users, only active and non-deleted promotions are returned. 
    For ADMIN and MANAGER, all promotions (including deleted/disabled) are returned. 
    Used for checking which promotions are linked to a product.`,
  })
  @ApiParam({ name: 'productId', type: String })
  @ApiResponse({
    status: 200,
    description: 'List of promotions for the product',
    type: [PromotionPreviewResponseDto],
  })
  async getPromotionsByProductId(
    @Param('productId') productId: string,
    @Req() req: Request,
  ) {
    try {
      const role = (req.user as JwtPayload).role;
      const promotions =
        await this.getPromotionsService.getPromotionsByProductId(
          productId,
          role,
        );
      return plainToInstance(PromotionPreviewResponseDto, promotions, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Get('by-category/:categoryId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get promotions by category ID',
    description: `Returns all promotions for a specific category. 
    For STAFF users, only active and non-deleted promotions are returned. 
    For ADMIN and MANAGER, all promotions (including deleted/disabled) are returned. 
    Used for checking which promotions are linked to a category.`,
  })
  @ApiParam({ name: 'categoryId', type: String })
  @ApiResponse({
    status: 200,
    description: 'List of promotions for the category',
    type: [PromotionPreviewResponseDto],
  })
  async getPromotionsByCategoryId(
    @Param('categoryId') categoryId: string,
    @Req() req: Request,
  ) {
    try {
      const role = (req.user as JwtPayload).role;
      const promotions =
        await this.getPromotionsService.getPromotionsByCategoryId(
          categoryId,
          role,
        );
      return plainToInstance(PromotionPreviewResponseDto, promotions, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post('validate')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Validate a promotion for a specific product',
    description: `Validates if a promotion can be applied to a specific product at purchase time. 
    Checks status, dates, usage limit, minimum value, and product/category eligibility. 
    Used at checkout to ensure a promotion is valid for the product and context.`,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        promotionId: {
          type: 'string',
          description: 'Promotion ID to validate',
        },
        productId: {
          type: 'string',
          description: 'Specific product ID',
        },
        productPrice: {
          type: 'number',
          description: 'Price of the specific product',
        },
        quantity: {
          type: 'number',
          description: 'Quantity of the specific product',
        },
        categoryId: {
          type: 'string',
          description:
            'Product category (optional, required for SPECIFIC_CATEGORIES)',
        },
      },
      required: ['promotionId', 'productId', 'productPrice', 'quantity'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Validation result',
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean' },
        reason: { type: 'string' },
        metadata: { type: 'object' },
      },
    },
  })
  async validatePromotion(
    @Body()
    dto: {
      promotionId: string;
      productId: string;
      productPrice: number;
      quantity: number;
      categoryId?: string;
    },
  ) {
    try {
      return await this.validatePromotionService.validate(dto);
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}
