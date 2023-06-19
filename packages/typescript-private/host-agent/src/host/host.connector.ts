import { PrivateHostToken } from '@dogu-private/console-host-agent';
import { createConsoleApiAuthHeader } from '@dogu-private/types';
import { DefaultHttpOptions, delay, errorify, Instance, parseAxiosError, transformAndValidate, validateAndEmitEventAsync } from '@dogu-tech/common';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { isAxiosError } from 'axios';
import { lastValueFrom } from 'rxjs';
import { config } from '../config';
import { ConsoleClientService } from '../console-client/console-client.service';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { OnHostConnectedEvent, OnHostConnectingEvent, OnHostDisconnectedEvent } from './host.events';

@Injectable()
export class HostConnector implements OnApplicationBootstrap {
  constructor(private readonly consoleClientService: ConsoleClientService, private readonly eventEmitter: EventEmitter2, private readonly logger: DoguLogger) {}

  onApplicationBootstrap(): void {
    setTimeout(() => {
      this.connect().catch((error) => {
        this.logger.error('Failed to connect host', { error: errorify(error) });
      });
    });
  }

  private async connect(): Promise<void> {
    try {
      await validateAndEmitEventAsync(this.eventEmitter, OnHostConnectingEvent, { token: env.DOGU_HOST_TOKEN });
    } catch (error) {
      this.logger.error('host connecting event emit failed', { error: errorify(error) });
    }
    let lastError: unknown | null = null;
    try {
      for (let i = 0; i < config.host.connect.retry.count; i++) {
        try {
          const pathProvider = new PrivateHostToken.findHostByToken.pathProvider();
          const path = PrivateHostToken.findHostByToken.resolvePath(pathProvider);
          const { data } = await lastValueFrom(
            this.consoleClientService.service.get<Instance<typeof PrivateHostToken.findHostByToken.responseBody>>(path, {
              ...createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
              timeout: DefaultHttpOptions.request.timeout,
            }),
          );
          const connectionInfo = await transformAndValidate(PrivateHostToken.findHostByToken.responseBody, data);
          await validateAndEmitEventAsync(this.eventEmitter, OnHostConnectedEvent, connectionInfo);
          this.logger.info(`ready - connected server with ${connectionInfo.hostId}`);
          return;
        } catch (error) {
          lastError = error;
          if (isAxiosError(error)) {
            if (error.response?.status === 401) {
              this.logger.error('host connection failed with Unauthorized(401)', { tryCount: i, error: parseAxiosError(error) });
              break;
            }
          }
          this.logger.error('host connection failed', { tryCount: i, error: parseAxiosError(error) });
          await delay(config.host.connect.retry.intervalMilliseconds);
        }
      }
      if (lastError === null) {
        throw new Error('Unexpected error');
      }
      throw lastError;
    } catch (error) {
      await validateAndEmitEventAsync(this.eventEmitter, OnHostDisconnectedEvent, { error: errorify(error) });
    }
  }
}
