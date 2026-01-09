/**
 * Filters for querying activity logs.
 */
export interface ActivityLogFilters {
  userId?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
}
