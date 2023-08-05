import { LoggerFactory } from '@dogu-tech/node';

export const logger = LoggerFactory.createLazy('console-backend');
export const timestampLogger = LoggerFactory.createLazy('timestamp', { withFileTransports: true });
