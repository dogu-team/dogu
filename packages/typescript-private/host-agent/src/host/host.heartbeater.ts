import { PrivateHost } from '@dogu-private/console-host-agent';
import { createConsoleApiAuthHeader, HostId, OrganizationId } from '@dogu-private/types';
import { DefaultHttpOptions, delay, errorify, Instance, isFilteredAxiosError, validateAndEmitEventAsync } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';
import { config } from '../config';
import { ConsoleClientService } from '../console-client/console-client.service';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { HostConnectionInfo } from '../types';
import { HostDisconnectedReason, OnHostDisconnectedEvent, OnHostResolvedEvent } from './host.events';

@Injectable()
export class HostHeartbeater {
  private hostConnectionInfo: HostConnectionInfo | null = null;

  constructor(private readonly consoleClientService: ConsoleClientService, private readonly logger: DoguLogger, private readonly eventEmitter: EventEmitter2) {}

  @OnEvent(OnHostResolvedEvent.key)
  onHostResolved(value: Instance<typeof OnHostResolvedEvent.value>): void {
    this.hostConnectionInfo = value;
  }

  @OnEvent(OnHostDisconnectedEvent.key)
  onHostDisconnected(value: Instance<typeof OnHostDisconnectedEvent.value>): void {
    this.hostConnectionInfo = null;
  }

  @Interval(config.host.heartbeat.intervalMilliseconds)
  async heartbeat(): Promise<void> {
    try {
      if (this.hostConnectionInfo === null) {
        return;
      }
      const { organizationId, hostId } = this.hostConnectionInfo;
      await this.updateHeartbeat(organizationId, hostId);
    } catch (error) {
      this.logger.error('Failed to update host heartbeat', {
        error: errorify(error),
      });
    }
  }

  private async updateHeartbeat(organizationId: OrganizationId, hostId: HostId): Promise<void> {
    let lastError: Error | null = null;
    let reason: HostDisconnectedReason = 'connection-failed';

    for (let i = 0; i < config.host.heartbeat.retry.count; i++) {
      try {
        const pathProvider = new PrivateHost.updateHostHeartbeatNow.pathProvider(organizationId, hostId);
        const path = PrivateHost.updateHostHeartbeatNow.resolvePath(pathProvider);
        await this.consoleClientService.client.patch(path, undefined, {
          ...createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
          timeout: DefaultHttpOptions.request.timeout,
        });
        return;
      } catch (error) {
        lastError = errorify(error);
        this.logger.error('Failed to update host heartbeat', {
          error: lastError,
        });

        if (isFilteredAxiosError(lastError)) {
          if (lastError.responseStatus === 401) {
            reason = 'invalid-token';
            break;
          }
        }

        await delay(config.host.heartbeat.retry.intervalMilliseconds);
      }
    }

    if (!lastError) {
      throw new Error('Internal error: must lastError be defined');
    }

    await validateAndEmitEventAsync(this.eventEmitter, OnHostDisconnectedEvent, {
      error: lastError,
      reason,
    });
  }
}
