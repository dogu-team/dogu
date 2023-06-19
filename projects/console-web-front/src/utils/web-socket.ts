export class WebSocketUrlResolver {
  resolve(pathWithQuery: string): string {
    const trancatedPathWithQuery = pathWithQuery.startsWith('/') ? pathWithQuery.slice(1) : pathWithQuery;
    return `${this.baseUrl()}/${trancatedPathWithQuery}`;
  }

  private baseUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_DOGU_WS_BASE_URL;
    if (typeof baseUrl !== 'string') {
      throw new Error('NEXT_PUBLIC_DOGU_WS_BASE_URL is not defined');
    }
    if (baseUrl.length === 0) {
      throw new Error('NEXT_PUBLIC_DOGU_WS_BASE_URL is empty');
    }
    if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
      throw new Error('NEXT_PUBLIC_DOGU_WS_BASE_URL must be ws:// or wss://');
    }

    return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }
}
