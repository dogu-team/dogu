import { PrivateDeviceJob } from '@dogu-private/console-host-agent';
import { createConsoleApiAuthHeader, DeviceId, OrganizationId, RoutineDeviceJobId } from '@dogu-private/types';
import { DefaultHttpOptions, errorify, Retry, stringifyError } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';
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
        const { organizationId, deviceId, routineDeviceJobId } = context;
        this.updateDeviceJobHeartbeatNow(organizationId, deviceId, routineDeviceJobId).catch((error) => {
          this.logger.error('DeviceJob heartbeat failed', {
            organizationId,
            deviceId,
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
  private async updateDeviceJobHeartbeatNow(organizationId: OrganizationId, deviceId: DeviceId, routineDeviceJobId: RoutineDeviceJobId): Promise<void> {
    const pathProvider = new PrivateDeviceJob.updateDeviceJobHeartbeatNow.pathProvider(organizationId, deviceId, routineDeviceJobId);
    const path = PrivateDeviceJob.updateDeviceJobHeartbeatNow.resolvePath(pathProvider);
    await lastValueFrom(
      this.consoleClientService.service.patch(path, null, {
        ...createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
        timeout: DefaultHttpOptions.request.timeout,
      }),
    );
    this.logger.debug('DeviceJob heartbeat updated', { organizationId, deviceId, routineDeviceJobId, timestamp: new Date() });
  }
}
