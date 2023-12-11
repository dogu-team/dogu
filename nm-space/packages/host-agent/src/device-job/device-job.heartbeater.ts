import { PrivateDeviceJob } from '@dogu-private/console-host-agent';
import { createConsoleApiAuthHeader, OrganizationId, RoutineDeviceJobId } from '@dogu-private/types';
import { DefaultHttpOptions, errorify, Retry, stringifyError } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { config } from '../config';
import { ConsoleClientService } from '../console-client/console-client.service';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { logger } from '../logger/logger.instance';
import { DeviceJobContextRegistry } from './device-job.context-registry';

@Injectable()
export class DeviceJobHeartbeater {
  constructor(
    private readonly consoleClientService: ConsoleClientService,
    private readonly logger: DoguLogger,
    private readonly deviceJobContextRegistry: DeviceJobContextRegistry,
  ) {}

  @Interval(config.deviceJob.heartbeat.intervalMilliseconds)
  heartbeat(): void {
    try {
      const { contexts } = this.deviceJobContextRegistry;
      for (const [key, context] of contexts) {
        const { executorOrganizationId, routineDeviceJobId } = context;
        this.updateDeviceJobHeartbeatNow(executorOrganizationId, routineDeviceJobId).catch((error) => {
          this.logger.error('DeviceJob heartbeat failed', {
            executorOrganizationId,
            routineDeviceJobId,
            timestamp: new Date(),
            error: stringifyError(error),
          });
        });
      }
    } catch (error) {
      this.logger.error('DeviceJob heartbeat failed', {
        error: errorify(error),
      });
    }
  }

  @Retry({ printable: logger })
  private async updateDeviceJobHeartbeatNow(organizationId: OrganizationId, routineDeviceJobId: RoutineDeviceJobId): Promise<void> {
    const pathProvider = new PrivateDeviceJob.updateDeviceJobHeartbeatNow.pathProvider(organizationId, routineDeviceJobId);
    const path = PrivateDeviceJob.updateDeviceJobHeartbeatNow.resolvePath(pathProvider);
    await this.consoleClientService.client.patch(path, null, {
      ...createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
      timeout: DefaultHttpOptions.request.timeout,
    });
    this.logger.debug('DeviceJob heartbeat updated', { organizationId, routineDeviceJobId, timestamp: new Date() });
  }
}
