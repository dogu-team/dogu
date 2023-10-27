import { AxiosHeaderValue } from 'axios';
import { env } from '../../../../env';

export function getBillingServerWebSocketUrl(): string {
  const url = new URL(env.DOGU_BILLING_SERVER_URL);
  url.protocol = url.protocol.replace('http', 'ws');
  const webSocketUrl = url.toString();
  return webSocketUrl.replace(/\/$/, '');
}

export function updateAuthHeaderByBillingApiToken(headers: Record<string, AxiosHeaderValue | string | null>): Record<string, AxiosHeaderValue | string | null> {
  const token = env.DOGU_BILLING_TOKEN;
  if (!token) {
    throw new Error('DOGU_BILLING_TOKEN is not set');
  }

  headers.Authorization = `Bearer ${token}`;
  return headers;
}

export function updateAuthHeaderBySelfHostedLicense(
  headers: Record<string, AxiosHeaderValue | string | null>,
  organizationId: string,
  licenseKey: string,
): Record<string, AxiosHeaderValue | string | null> {
  const raw = `${organizationId}:${licenseKey}`;
  const encoded = Buffer.from(raw).toString('base64');
  headers.Authorization = `Basic ${encoded}`;
  return headers;
}
