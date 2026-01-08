import winston, { createLogger, format, transports } from 'winston';
import { levels } from './constants';
import path from 'path';
import fs from 'fs';

// Ensure the logs directory exists before writing logs to file
// This prevents runtime errors if the directory is missing
const logDir = path.resolve('logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Winston logger instance with custom levels, formatting, and transports.
 *
 * Features:
 * - Logs to the console at all levels (colorized output in development)
 * - Logs only errors to logs/error.log for persistent error tracking
 * - Uses a higher log level in production ("warn") to reduce noise
 * - Uses a lower log level in development ("debug") for maximum visibility
 * - Formats each log entry as: [timestamp] LEVEL: message
 *
 * @example
 *  import { logger } from "./utils/logger";
 *  logger.info("Server started");
 *  logger.error("Something went wrong");
 */
export const logger: winston.Logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.printf(({ level, message, timestamp }) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    }),
  ),
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug', // Set log level based on environment
  levels,
  transports: [
    // Log all levels to the console (stdout)
    new transports.Console(),
    // Log only errors to a file in the logs
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
  ],
});

export default logger;
