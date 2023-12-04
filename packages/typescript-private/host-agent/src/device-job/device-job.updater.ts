import { DeviceJobStatusInfo, PrivateDeviceJob, StepStatusInfo } from '@dogu-private/console-host-agent';
import { createConsoleApiAuthHeader, OrganizationId, RoutineDeviceJobId } from '@dogu-private/types';
import { DefaultHttpOptions, errorify, Instance, Retry } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConsoleClientService } from '../console-client/console-client.service';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { logger } from '../logger/logger.instance';
import { OnDeviceJobPostProcessCompletedEvent, OnDeviceJobPrePocessStartedEvent } from './device-job.events';

@Injectable()
export class DeviceJobUpdater {
  constructor(
    private readonly consoleClientService: ConsoleClientService,
    private readonly logger: DoguLogger,
  ) {}

  @OnEvent(OnDeviceJobPostProcessCompletedEvent.key)
  async onDeviceJobPostProcessCompleted(value: Instance<typeof OnDeviceJobPostProcessCompletedEvent.value>): Promise<void> {
    const { executorOrganizationId, routineDeviceJobId, deviceJobStatusInfo, stepStatusInfos } = value;
    await this.updateDeviceJobStatus(executorOrganizationId, routineDeviceJobId, deviceJobStatusInfo, stepStatusInfos);
  }

  @OnEvent(OnDeviceJobPrePocessStartedEvent.key)
  async OnDeviceJobPrePocessStarted(value: Instance<typeof OnDeviceJobPrePocessStartedEvent.value>): Promise<void> {
    const { executorOrganizationId, routineDeviceJobId, localStartedAt } = value;
    await this.updateDeviceJobLocalStartedAt(executorOrganizationId, routineDeviceJobId, localStartedAt);
  }

  @Retry({ printable: logger })
  private async updateDeviceJobLocalStartedAt(organizationId: OrganizationId, routineDeviceJobId: RoutineDeviceJobId, localStartedAt: Date): Promise<void> {
    const pathProvider = new PrivateDeviceJob.updateDeviceJobLocalStartedAt.pathProvider(organizationId, routineDeviceJobId);
    const path = PrivateDeviceJob.updateDeviceJobLocalStartedAt.resolvePath(pathProvider);
    const requestBody: Instance<typeof PrivateDeviceJob.updateDeviceJobLocalStartedAt.requestBody> = {
      localStartedAt,
    };
    await this.consoleClientService.client
      .patch(path, requestBody, {
        ...createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
        timeout: DefaultHttpOptions.request.timeout,
      })
      .catch((error) => {
        this.logger.error('Failed to update deviceJob localStartedAt', {
          organizationId,
          routineDeviceJobId,
          localStartedAt,
          error: errorify(error),
        });
        throw error;
      });
    this.logger.verbose('DeviceJob localStartedAt updated', { organizationId, routineDeviceJobId, localStartedAt });
  }

  @Retry({ printable: logger })
  private async updateDeviceJobStatus(
    organizationId: OrganizationId,
    routineDeviceJobId: RoutineDeviceJobId,
    deviceJobStatusInfo: DeviceJobStatusInfo,
    stepStatusInfos: StepStatusInfo[],
  ): Promise<void> {
    const pathProvider = new PrivateDeviceJob.updateDeviceJobStatus.pathProvider(organizationId, routineDeviceJobId);
    const path = PrivateDeviceJob.updateDeviceJobStatus.resolvePath(pathProvider);
    const requestBody: Instance<typeof PrivateDeviceJob.updateDeviceJobStatus.requestBody> = {
      deviceJobStatusInfo,
      stepStatusInfos,
    };
    await this.consoleClientService.client
      .patch(path, requestBody, {
        ...createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
        timeout: DefaultHttpOptions.request.timeout,
      })
      .catch((error) => {
        this.logger.error('Failed to update deviceJob status', {
          organizationId,
          routineDeviceJobId,
          deviceJobStatusInfo,
          error: errorify(error),
        });
        throw error;
      });
    this.logger.verbose('DeviceJob status updated', { organizationId, routineDeviceJobId, deviceJobStatusInfo });
  }
}
