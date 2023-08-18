import { PrivateHostToken } from '@dogu-private/console-host-agent';
import { createConsoleApiAuthHeader } from '@dogu-private/types';
import { DefaultHttpOptions, delay, errorify, Instance, isFilteredAxiosError, transformAndValidate, validateAndEmitEventAsync } from '@dogu-tech/common';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { config } from '../config';
import { ConsoleClientService } from '../console-client/console-client.service';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { HostDisconnectedReason, OnHostConnectedEvent, OnHostConnectingEvent, OnHostDisconnectedEvent } from './host.events';

@Injectable()
export class HostConnector implements OnApplicationBootstrap {
  constructor(private readonly consoleClientService: ConsoleClientService, private readonly eventEmitter: EventEmitter2, private readonly logger: DoguLogger) {}

  onApplicationBootstrap(): void {
    this.connectNextTick();
  }

  private connectNextTick(): void {
    setTimeout(() => {
      this.connect().catch((error) => {
        this.logger.error('Failed to connect host', { error: errorify(error) });
      });
    });
  }

  @OnEvent(OnHostDisconnectedEvent.key)
  onHostDisconnected(value: Instance<typeof OnHostDisconnectedEvent.value>): void {
    const { reason } = value;
    this.logger.warn('host disconnected', { reason });

    if (reason === 'connection-failed') {
      this.connectNextTick();
    }
  }

  private async connect(): Promise<void> {
    try {
      await validateAndEmitEventAsync(this.eventEmitter, OnHostConnectingEvent, { token: env.DOGU_HOST_TOKEN });
    } catch (error) {
      this.logger.error('host connecting event emit failed', { error: errorify(error) });
    }

    let lastError: Error | null = null;
    let reason: HostDisconnectedReason = 'connection-failed';

    try {
      for (let i = 0; i < config.host.connect.retry.count; i++) {
        try {
          const pathProvider = new PrivateHostToken.findHostByToken.pathProvider();
          const path = PrivateHostToken.findHostByToken.resolvePath(pathProvider);
          const { data } = await this.consoleClientService.client.get<Instance<typeof PrivateHostToken.findHostByToken.responseBody>>(path, {
            ...createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
            timeout: DefaultHttpOptions.request.timeout,
          });
          const connectionInfo = await transformAndValidate(PrivateHostToken.findHostByToken.responseBody, data);
          await validateAndEmitEventAsync(this.eventEmitter, OnHostConnectedEvent, connectionInfo);
          this.logger.info(`ready - connected server with ${connectionInfo.hostId}`);
          return;
        } catch (error) {
          lastError = errorify(error);

          if (isFilteredAxiosError(error)) {
            if (error.responseStatus === 401) {
              reason = 'invalid-token';
              this.logger.error('host connection failed with Unauthorized(401)', { tryCount: i, error });
              break;
            }
          }

          this.logger.error('host connection failed', { tryCount: i, error });
          await delay(config.host.connect.retry.intervalMilliseconds);
        }
      }

      if (lastError === null) {
        throw new Error('Internal error: lastError is null');
      }

      throw lastError;
    } catch (error) {
      await validateAndEmitEventAsync(this.eventEmitter, OnHostDisconnectedEvent, { error: errorify(error), reason });
    }
  }
}
