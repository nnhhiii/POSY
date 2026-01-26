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
  UseGuards,
} from '@nestjs/common';
import { CreateCategoryService } from './create-category/create-category.service';
import { UpdateCategoryService } from './update-category/update-category.service';
import { DeleteCategoryService } from './delete-category/delete-category.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { Role } from '../../common/enums';
import { Roles } from '../../common/decorators';
import { GetCategoriesService } from './get-categories/get-categories.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { plainToInstance } from 'class-transformer';
import {
  CategoryDetailedResponseDto,
  CategoryPreviewResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto';
import { Page } from '../../common/interfaces';
import { CategoryNotFoundException } from './exceptions';
import { Category } from './types';
import {
  DuplicateEntryException,
  ForeignKeyViolationException,
  RelatedRecordNotFoundException,
} from '../../common/exceptions';
import { PaginationQueryDto } from '../../common/config/pagination.query.dto';

@Controller('category')
export class CategoryController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(
    private readonly getCategoriesService: GetCategoriesService,
    private readonly createCategoryService: CreateCategoryService,
    private readonly updateCategoryService: UpdateCategoryService,
    private readonly deleteCategoryService: DeleteCategoryService,
  ) {}

  @Get(':id')
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  async getCategoryById(
    @Param('id') id: string,
  ): Promise<CategoryDetailedResponseDto> {
    const category = await this.getCategoriesService.getCategoryById(id);

    return plainToInstance(CategoryDetailedResponseDto, category, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  async getCategories(
    @Query() pagination: PaginationQueryDto,
  ): Promise<Page<CategoryPreviewResponseDto>> {
    const categoryPage = await this.getCategoriesService.getCategories(
      pagination.page,
      pagination.pageSize,
    );

    const categoryPreviewItems = plainToInstance(
      CategoryPreviewResponseDto,
      categoryPage.items,
      { excludeExtraneousValues: true },
    );

    return {
      ...categoryPage,
      items: categoryPreviewItems,
    };
  }

  @Post('')
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  async createCategory(@Body() dto: CreateCategoryDto) {
    try {
      const category = await this.createCategoryService.createCategory(
        dto as Category,
      );
      return plainToInstance(CategoryPreviewResponseDto, category, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof DuplicateEntryException) {
        throw new BadRequestException(e.message);
      } else if (e instanceof RelatedRecordNotFoundException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    try {
      const category = await this.updateCategoryService.updateCategoryById(
        id,
        dto as Partial<Category>,
      );
      return plainToInstance(CategoryDetailedResponseDto, category, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof CategoryNotFoundException) {
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

  @Post(':id/toggle-active')
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  async toggleCategoryActive(@Param('id') id: string) {
    try {
      await this.updateCategoryService.toggleCategoryActive(id);
      return {
        message: 'Category active status has been successfully toggled.',
      };
    } catch (e) {
      if (e instanceof CategoryNotFoundException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  async deleteCategory(@Param('id') id: string) {
    try {
      await this.deleteCategoryService.deleteCategoryById(id);
      return { message: 'Category has been successfully deleted.' };
    } catch (e) {
      if (e instanceof CategoryNotFoundException) {
        throw new BadRequestException(e.message);
      } else if (e instanceof ForeignKeyViolationException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}
