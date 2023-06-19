import { LoggerFactory } from '@dogu-tech/node';

export const ActionLogger = LoggerFactory.createLazy('action', { level: 'info', withFileTransports: false });
