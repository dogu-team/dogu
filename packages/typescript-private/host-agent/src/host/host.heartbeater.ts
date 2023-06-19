import { PrivateHost } from '@dogu-private/console-host-agent';
import { createConsoleApiAuthHeader, HostId, OrganizationId } from '@dogu-private/types';
import { DefaultHttpOptions, Instance, parseAxiosError, Retry, validateAndEmitEventAsync } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';
import { config } from '../config';
import { ConsoleClientService } from '../console-client/console-client.service';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { logger } from '../logger/logger.instance';
import { HostConnectionInfo } from '../types';
import { OnHostDisconnectedEvent, OnHostResolvedEvent } from './host.events';

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
        error: parseAxiosError(error),
      });
    }
  }

  @Retry({ retryCount: config.host.heartbeat.retry.count, retryInterval: config.host.heartbeat.retry.intervalMilliseconds, printable: logger })
  private async updateHeartbeat(organizationId: OrganizationId, hostId: HostId): Promise<void> {
    const pathProvider = new PrivateHost.updateHostHeartbeatNow.pathProvider(organizationId, hostId);
    const path = PrivateHost.updateHostHeartbeatNow.resolvePath(pathProvider);
    await lastValueFrom(
      this.consoleClientService.service.patch(path, undefined, {
        ...createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
        timeout: DefaultHttpOptions.request.timeout,
      }),
    ).catch(async (error) => {
      const parsed = parseAxiosError(error);
      this.logger.error('Failed to update host heartbeat', {
        error: parsed,
      });
      if (parsed instanceof Error) {
        throw parsed;
      }
      if (parsed.response?.status === 401) {
        await validateAndEmitEventAsync(this.eventEmitter, OnHostDisconnectedEvent, {
          error: parsed,
        });
      }
    });
  }
}
