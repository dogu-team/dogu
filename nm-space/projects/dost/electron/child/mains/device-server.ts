import { bootstrap, onErrorToExit } from '@dogu-private/device-server';
import { logger } from '../../log/logger.instance';

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
  onErrorToExit(reason);
});

process.on('uncaughtException', (error, origin) => {
  logger.error('Uncaught exception', { error, origin });
  onErrorToExit(error);
});

logger.info('device-server env', { env: process.env });

bootstrap().catch((error) => {
  logger.error('Unexpected error', { error });
  onErrorToExit(error);
});
