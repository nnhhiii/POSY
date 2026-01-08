/**
 * Custom log levels for Winston.
 *
 * @property {number} error - Critical errors that require immediate attention (most severe).
 * @property {number} warn  - Warnings about potentially harmful situations.
 * @property {number} info  - General informational messages.
 * @property {number} http  - HTTP request logs (useful for web servers).
 * @property {number} debug - Detailed debug information for development (least severe).
 */
export const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};
