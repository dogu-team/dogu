import { bootstrap, onErrorToExit } from '@dogu-private/host-agent';
import { errorify } from '@dogu-tech/common';

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection', { reason, promise });
});

process.on('uncaughtException', (error, origin) => {
  console.error('Uncaught exception', { error, origin });
  onErrorToExit(error);
});

console.info('host-agent env', { env: process.env });

bootstrap().catch((error) => {
  throw errorify(error);
});
