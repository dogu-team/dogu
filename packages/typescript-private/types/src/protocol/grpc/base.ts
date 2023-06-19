import { CallOptions, Client, Metadata, MetadataOptions } from '@grpc/grpc-js';

export class GrpcClientBase {
  protected serverUrl: string;
  protected readonly timeoutSeconds: number;
  protected client: Client | null = null;

  constructor(serverUrl: string, timeoutSeconds: number) {
    this.serverUrl = serverUrl;
    this.timeoutSeconds = timeoutSeconds;
  }

  protected waitForReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.client == null) {
        throw new Error('Client is not initialized');
      }

      this.client.waitForReady(this.createDeadline(), (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  static createClientOption(): Record<string, unknown> | undefined {
    return {
      // https://grpc.github.io/grpc/core/group__grpc__arg__keys.html
      'grpc.keepalive_time_ms': '1000',
      'grpc.keepalive_timeout_ms': '1000',
      'grpc.initial_reconnect_backoff_ms': '1000',
      'grpc.min_reconnect_backoff_ms': '1000',
      'grpc.max_reconnect_backoff_ms': '3000',
    };
  }

  protected createDeadline(): Date {
    const current = new Date();
    return new Date(current.getTime() + this.timeoutSeconds * 1000);
  }

  protected createMetadata(options?: MetadataOptions): Metadata {
    return new Metadata(options);
  }

  protected createCallOptions(options?: CallOptions): CallOptions {
    return { deadline: this.createDeadline(), ...options };
  }
}
