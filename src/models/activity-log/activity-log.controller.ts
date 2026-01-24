import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/authorization/guards/role.guard';
import { Role } from '../../common/enums';
import { Roles } from '../../common/decorators';
import { ActivityLogService } from './activity-log.service';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('log')
@UseGuards(AuthGuard('jwt'), RoleGuard)
@Roles(Role.ADMIN)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  async findAll(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('entity') entity?: string,
    @Query('entityId') entityId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.activityLogService.findAll({
      page: Number(page),
      pageSize: Number(pageSize),
      filters: {
        userId,
        action,
        entity,
        entityId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
  }

  @Get('recent')
  async findRecent(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.activityLogService.findRecent({
      page: Number(page),
      pageSize: Number(pageSize),
    });
  }

  @Get('by-user/:userId')
  async findByUser(@Query('userId') userId: string) {
    return this.activityLogService.findByUserId(userId);
  }
}
