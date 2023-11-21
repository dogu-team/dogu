import { PrivateDeviceJob, WriteDeviceJobLogsRequestBody } from '@dogu-private/console-host-agent';
import { createConsoleApiAuthHeader, DeviceJobLog, OrganizationId, RoutineDeviceJobId } from '@dogu-private/types';
import { DefaultHttpOptions, errorify, Instance, Retry, stringify } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';
import { ConsoleClientService } from '../console-client/console-client.service';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { logger } from '../logger/logger.instance';
import { OnDeviceJobLoggedEvent } from './device-job.events';

@Injectable()
export class DeviceJobLogger {
  private readonly buffers = new Map<string, DeviceJobLog[]>();

  constructor(
    private readonly consoleClientService: ConsoleClientService,
    private readonly logger: DoguLogger,
  ) {}

  @Interval(1000)
  flush(): void {
    try {
      for (const [key, buffer] of this.buffers) {
        const [organizationId, routineDeviceJobId] = this.parseKey(key);
        this.sendDeviceJobLog(organizationId, routineDeviceJobId, { logs: buffer }).catch((error) => {
          this.logger.error('Failed to send device job log', {
            organizationId,
            routineDeviceJobId,
            body: { logs: buffer },
            error: stringify(error),
          });
        });
        this.buffers.delete(key);
      }
    } catch (error) {
      this.logger.error('Failed to flush device job log buffer', {
        error: errorify(error),
      });
    }
  }

  @OnEvent(OnDeviceJobLoggedEvent.key)
  onDeviceJobLoggedEvent(value: Instance<typeof OnDeviceJobLoggedEvent.value>): void {
    const key = this.createKey(value.organizationId, value.routineDeviceJobId);
    const buffer = this.buffers.get(key);
    if (buffer === undefined) {
      this.buffers.set(key, [value.log]);
      return;
    } else {
      buffer.push(value.log);
    }
  }

  @Retry({ printable: logger })
  private async sendDeviceJobLog(organizationId: OrganizationId, routineDeviceJobId: RoutineDeviceJobId, body: WriteDeviceJobLogsRequestBody): Promise<void> {
    const pathProvider = new PrivateDeviceJob.writeDeviceJobLogs.pathProvider(organizationId, routineDeviceJobId);
    const path = PrivateDeviceJob.writeDeviceJobLogs.resolvePath(pathProvider);
    await this.consoleClientService.client
      .post(path, body, {
        ...createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
        timeout: DefaultHttpOptions.request.timeout,
      })
      .catch((error) => {
        this.logger.error('Failed to send device job log', {
          organizationId,
          routineDeviceJobId,
          body,
          error: errorify(error),
        });
        throw error;
      });
  }

  private createKey(organizationId: OrganizationId, routineDeviceJobId: RoutineDeviceJobId): string {
    return `${organizationId}:${routineDeviceJobId}`;
  }

  private parseKey(key: string): [OrganizationId, RoutineDeviceJobId] {
    const [organizationId, routineDeviceJobId] = key.split(':');
    return [organizationId, Number(routineDeviceJobId)];
  }
}
