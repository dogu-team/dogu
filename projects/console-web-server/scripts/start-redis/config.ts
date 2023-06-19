import { env } from '../../src/env';

export const config = {
  imageName: 'redis:7.0.7',
  containerName: 'dogu-redis',
  host: env.DOGU_REDIS_HOST,
  port: env.DOGU_REDIS_PORT,
};

console.log('config', config);
