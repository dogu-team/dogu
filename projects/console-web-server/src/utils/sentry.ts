import { env } from '../env';

export function isSentryEnabled(): boolean {
  return env.DOGU_RUN_TYPE === 'production' || env.DOGU_RUN_TYPE === 'development';
}
