import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
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
    @Query('id') id: string,
  ): Promise<CategoryPreviewResponseDto> {
    try {
      const category = await this.getCategoriesService.getCategoryById(id);
      return plainToInstance(CategoryPreviewResponseDto, category, {
        excludeExtraneousValues: true,
      });
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

  @Get('')
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  async getCategories(
    @Query() query: any,
  ): Promise<Page<CategoryPreviewResponseDto>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
    const page = query.page ? parseInt(query.page) : undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
    const pageSize = query.pageSize ? parseInt(query.pageSize) : undefined;

    try {
      const categoryPage = await this.getCategoriesService.getCategories(
        page,
        pageSize,
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
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
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
    @Query('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    try {
      const category = await this.updateCategoryService.updateCategoryById(
        id,
        dto as Partial<Category>,
      );
      return plainToInstance(CategoryPreviewResponseDto, category, {
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
  async toggleCategoryActive(@Query('id') id: string) {
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
  async deleteCategory(@Query('id') id: string) {
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
