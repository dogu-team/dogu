import { env } from '../../../../env';

export function getBillingServerWebSocketUrl(): string {
  const url = new URL(env.DOGU_BILLING_SERVER_URL);
  url.protocol = url.protocol.replace('http', 'ws');
  const webSocketUrl = url.toString();
  return webSocketUrl.replace(/\/$/, '');
}
