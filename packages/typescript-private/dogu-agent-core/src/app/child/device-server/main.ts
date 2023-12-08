import { bootstrap, onErrorToExit } from '@dogu-private/device-server';
import { errorify } from '@dogu-tech/common';

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection', { reason, promise });
  onErrorToExit(reason);
});

process.on('uncaughtException', (error, origin) => {
  console.error('Uncaught exception', { error, origin });
  onErrorToExit(error);
});

console.info('device-server env', { env: process.env });

bootstrap().catch((error) => {
  throw errorify(error);
});
