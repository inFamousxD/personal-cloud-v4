import winston from 'winston';
import { config } from '../config';

// Define custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create the logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'productivity-suite-backend' },
  transports: [
    // Write logs to file
    new winston.transports.File({
      filename: config.logging.file,
      level: 'error',
    }),
    new winston.transports.File({
      filename: config.logging.file.replace('app.log', 'combined.log'),
    }),
  ],
});

// If we're not in production, also log to console
if (config.nodeEnv !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Export a stream object for Morgan integration
export const stream = {
  write: (message: string): void => {
    logger.info(message.trim());
  },
};

// Utility functions for common logging patterns
export const logError = (error: Error, context?: Record<string, unknown>): void => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

export const logInfo = (message: string, context?: Record<string, unknown>): void => {
  logger.info({
    message,
    ...context,
  });
};

export const logWarning = (message: string, context?: Record<string, unknown>): void => {
  logger.warn({
    message,
    ...context,
  });
};

export const logDebug = (message: string, context?: Record<string, unknown>): void => {
  logger.debug({
    message,
    ...context,
  });
};