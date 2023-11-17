import { env } from './env';

export function isSentryEnabled(): boolean {
  return env.DOGU_BILLING_RUN_TYPE === 'production' || env.DOGU_BILLING_RUN_TYPE === 'development';
}
