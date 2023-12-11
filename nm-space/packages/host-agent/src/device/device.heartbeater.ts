import { PrivateDevice } from '@dogu-private/console-host-agent';
import { createConsoleApiAuthHeader, DeviceId, OrganizationId, Serial } from '@dogu-private/types';
import { DefaultHttpOptions, errorify, Retry, stringifyError } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { config } from '../config';
import { ConsoleClientService } from '../console-client/console-client.service';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { logger } from '../logger/logger.instance';
import { DeviceRegistry } from './device.registry';

@Injectable()
export class DeviceHeartbeater {
  constructor(
    private readonly deviceRegistry: DeviceRegistry,
    private readonly consoleClientService: ConsoleClientService,
    private readonly logger: DoguLogger,
  ) {}

  @Interval(config.device.heartbeat.intervalMilliseconds)
  heartbeat(): void {
    try {
      const { devices } = this.deviceRegistry;
      for (const [serial, { deviceId, organizationId }] of devices) {
        this.updateDeviceHeartbeatNow(organizationId, deviceId, serial).catch((error) => {
          this.logger.error('Device heartbeat failed', {
            serial,
            deviceId,
            organizationId,
            error: stringifyError(error),
          });
        });
      }
    } catch (error) {
      this.logger.error('Device heartbeat failed', {
        error: errorify(error),
      });
    }
  }

  @Retry({ printable: logger, retryInterval: 1000 })
  private async updateDeviceHeartbeatNow(organizationId: OrganizationId, deviceId: DeviceId, serial: Serial): Promise<void> {
    const pathProvider = new PrivateDevice.updateDeviceHeartbeatNow.pathProvider(organizationId, deviceId);
    const path = PrivateDevice.updateDeviceHeartbeatNow.resolvePath(pathProvider);
    await this.consoleClientService.client
      .patch(path, null, {
        ...createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
        timeout: DefaultHttpOptions.request.timeout,
      })
      .catch((error) => {
        this.logger.error('Device heartbeat failed', {
          serial,
          deviceId,
          organizationId,
          error: errorify(error),
        });
        throw error;
      });
  }
}
