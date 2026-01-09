import { ActivityLogFilters } from './index';
import { PaginationParams } from '../../../common/interfaces';

/**
 * Pagination parameters for activity logs.
 */
export interface ActivityLogPaginationParams extends PaginationParams {
  filters?: ActivityLogFilters;
}
