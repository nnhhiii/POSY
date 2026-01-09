import { ActivityLog } from '../types';
import { Page, PaginationParams } from '../../../common/interfaces';
import { ActivityLogPaginationParams } from '../interfaces';

export abstract class ActivityLogRepository {
  /**
   * Creates a new activity log entry.
   *
   * @param activityLog - The activity log data to create.
   * @returns A promise that resolves to the created activity log.
   *
   * @example
   * const log = await repository.create(new ActivityLog(
   *   null, 'user-id', 'LOGIN', 'USER', 'user-id', null, '127.0.0.1', 'Mozilla/5.0', null
   * ));
   */
  abstract create(activityLog: ActivityLog): Promise<ActivityLog>;

  /**
   * Finds an activity log by its unique identifier.
   *
   * @param id - The unique identifier of the activity log.
   * @returns A promise that resolves to the activity log if found, otherwise null.
   */
  abstract findById(id: string): Promise<ActivityLog | null>;

  /**
   * Retrieves all activity logs for a specific user with pagination.
   *
   * @param userId - The unique identifier of the user.
   * @param paginationParams - The parameters to support pagination
   * @returns A promise that resolves to a paginated list of activity logs.
   */
  abstract findByUserId(
    userId: string,
    paginationParams: PaginationParams,
  ): Promise<Page<ActivityLog>>;

  /**
   * Retrieves all activity logs for a specific entity with pagination.
   *
   * @param entity - The entity type (e.g., 'USER', 'CATEGORY', 'PRODUCT').
   * @param entityId - The unique identifier of the entity.
   * @param paginationParams - The parameters to support pagination
   * @returns A promise that resolves to a paginated list of activity logs.
   */
  abstract findByEntity(
    entity: string,
    entityId: string,
    paginationParams: PaginationParams,
  ): Promise<Page<ActivityLog>>;

  /**
   * Retrieves all activity logs for a specific action with pagination.
   *
   * @param action - The action type (e.g., 'LOGIN', 'UPDATE_PROFILE', 'DELETE_PRODUCT').
   * @param paginationParams - The parameters to support pagination
   * @returns A promise that resolves to a paginated list of activity logs.
   */
  abstract findByAction(
    action: string,
    paginationParams: PaginationParams,
  ): Promise<Page<ActivityLog>>;

  /**
   * Retrieves activity logs within a specific date range with pagination.
   *
   * @param startDate - The start date of the range.
   * @param endDate - The end date of the range.
   * @param paginationParams - The parameters to support pagination
   * @returns A promise that resolves to a paginated list of activity logs.
   */
  abstract findByDateRange(
    startDate: Date,
    endDate: Date,
    paginationParams: PaginationParams,
  ): Promise<Page<ActivityLog>>;

  /**
   * Retrieves all activity logs with optional filters and pagination.
   *
   * @param params - Pagination parameters and optional filters.
   * @returns A promise that resolves to a paginated list of activity logs.
   *
   * @example
   * const logs = await repository.findAll({
   *   page: 1,
   *   pageSize: 20,
   *   filters: { userId: 'user-id', action: 'LOGIN' }
   * });
   */
  abstract findAll(
    params: ActivityLogPaginationParams,
  ): Promise<Page<ActivityLog>>;

  /**
   * Retrieves the most recent activity logs with pagination.
   *
   * @param paginationParams - The parameters to support pagination
   * @returns A promise that resolves to a paginated list of recent activity logs.
   */
  abstract findRecent(
    paginationParams: PaginationParams,
  ): Promise<Page<ActivityLog>>;

  // /**
  //  * Counts the total number of activity logs for a specific user.
  //  *
  //  * @param userId - The unique identifier of the user.
  //  * @returns A promise that resolves to the total count of logs.
  //  */
  // abstract countByUserId(userId: string): Promise<number>;
  //
  // /**
  //  * Counts the total number of activity logs for a specific action.
  //  *
  //  * @param action - The action type.
  //  * @returns A promise that resolves to the total count of logs.
  //  */
  // abstract countByAction(action: string): Promise<number>;
}
