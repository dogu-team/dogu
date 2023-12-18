import { PrivateHostToken } from '@dogu-private/console-host-agent';
import { createConsoleApiAuthHeader } from '@dogu-private/types';
import { DefaultHttpOptions, errorify, Instance, isFilteredAxiosError, transformAndValidate, validateAndEmitEventAsync } from '@dogu-tech/common';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import AsyncLock from 'async-lock';
import { config } from '../config';
import { ConsoleClientService } from '../console-client/console-client.service';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { HostDisconnectedReason, OnHostConnectedEvent, OnHostConnectingEvent, OnHostDisconnectedEvent } from './host.events';
import { HostResolver } from './host.resolver';

@Injectable()
export class HostConnector implements OnApplicationBootstrap {
  constructor(
    private readonly consoleClientService: ConsoleClientService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: DoguLogger,
    private readonly hostResolver: HostResolver,
  ) {}

  private connectLock = new AsyncLock();
  private isConnected = false;

  onApplicationBootstrap(): void {
    this.connectAfterTimeout();
  }

  private connectAfterTimeout(timeout = 0): void {
    setTimeout(() => {
      this.tryConnect().catch((error) => {
        this.logger.error('Failed to connect host', { error: errorify(error) });
      });
    }, timeout);
  }

  @OnEvent(OnHostDisconnectedEvent.key)
  onHostDisconnected(value: Instance<typeof OnHostDisconnectedEvent.value>): void {
    const { reason } = value;
    this.isConnected = false;
    this.logger.warn('host disconnected', { reason });

    if (reason === 'connection-failed') {
      this.connectAfterTimeout(config.host.reconnect.intervalMilliseconds);
    }
  }

  private async tryConnect(): Promise<void> {
    await this.connectLock
      .acquire('connect', async () => {
        if (this.isConnected) {
          return;
        }
        await validateAndEmitEventAsync(this.eventEmitter, OnHostConnectingEvent, { token: env.DOGU_HOST_TOKEN }).catch((error) => {
          this.logger.error('host connecting event emit failed', { error: errorify(error) });
        });

        try {
          const connectionInfo = await this.getConnectionInfo();
          await validateAndEmitEventAsync(this.eventEmitter, OnHostConnectedEvent, connectionInfo);
          await this.hostResolver.resolve(connectionInfo);
          this.isConnected = true;
          this.logger.info(`ready - connected server with ${connectionInfo.hostId}`);
          return;
        } catch (e) {
          const error = errorify(e);
          let reason: HostDisconnectedReason = 'connection-failed';

          if (isFilteredAxiosError(error)) {
            if (error.responseStatus === 401) {
              reason = 'invalid-token';
              this.logger.error('host connection failed with Unauthorized(401)', { error });
            }
          }
          await validateAndEmitEventAsync(this.eventEmitter, OnHostDisconnectedEvent, { error: errorify(error), reason });
        }
      })
      .catch((error) => {
        this.logger.error('host connect lock failed', { error: errorify(error) });
      });
  }

  private async getConnectionInfo(): Promise<Instance<typeof PrivateHostToken.findHostByToken.responseBody>> {
    const pathProvider = new PrivateHostToken.findHostByToken.pathProvider();
    const path = PrivateHostToken.findHostByToken.resolvePath(pathProvider);
    const { data } = await this.consoleClientService.client.get<Instance<typeof PrivateHostToken.findHostByToken.responseBody>>(path, {
      ...createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
      timeout: DefaultHttpOptions.request.timeout,
    });
    return await transformAndValidate(PrivateHostToken.findHostByToken.responseBody, data);
  }
}
