import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  defaultMeta: { service: 'env-generator' },
  transports: [new winston.transports.Console()],
  format: winston.format.combine(winston.format.colorize(), winston.format.cli()),
});
