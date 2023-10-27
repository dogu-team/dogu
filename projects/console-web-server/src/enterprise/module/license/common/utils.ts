import _ from 'lodash';
import { env } from '../../../../env';

export function getBillingServerWebSocketUrl(): string {
  const url = new URL(env.DOGU_BILLING_SERVER_URL);
  url.protocol = url.protocol.replace('http', 'ws');
  const webSocketUrl = url.toString();
  return webSocketUrl.replace(/\/$/, '');
}

export function updateAuthHeaderByBillingApiToken(headers: object): object {
  const token = env.DOGU_BILLING_TOKEN;
  if (!token) {
    throw new Error('DOGU_BILLING_TOKEN is not set');
  }

  _.set(headers, 'Authorization', `Bearer ${token}`);
  return headers;
}

export function updateAuthHeaderBySelfHostedLicense(headers: object, organizationId: string, licenseKey: string): object {
  const raw = `${organizationId}:${licenseKey}`;
  const encoded = Buffer.from(raw).toString('base64');
  _.set(headers, 'Authorization', `Basic ${encoded}`);
  return headers;
}
