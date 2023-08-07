import { env } from '../env';

export function getConsoleBaseUrl(): string {
  return env.DOGU_API_BASE_URL.endsWith('/') ? env.DOGU_API_BASE_URL.slice(0, -1) : env.DOGU_API_BASE_URL;
}

export function getConsoleBaseUrlWs(): string {
  return `${getConsoleBaseUrl().replace('http://', 'ws://').replace('https://', 'wss://')}`;
}
