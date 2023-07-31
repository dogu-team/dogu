import { PrivateStep } from '@dogu-private/console-host-agent';
import { createConsoleApiAuthHeader, DeviceId, OrganizationId, PIPELINE_STATUS, RoutineStepId } from '@dogu-private/types';
import { DefaultHttpOptions, errorify, Instance, Retry } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConsoleClientService } from '../console-client/console-client.service';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { logger } from '../logger/logger.instance';
import { OnStepCompletedEvent, OnStepStartedEvent } from './step.events';

@Injectable()
export class StepUpdater {
  constructor(private readonly consoleClientService: ConsoleClientService, private readonly logger: DoguLogger) {}

  @OnEvent(OnStepStartedEvent.key)
  async onStepInProgressEvent(value: Instance<typeof OnStepStartedEvent.value>): Promise<void> {
    const { organizationId, deviceId, routineStepId, localTimeStamp } = value;
    await this.updateStepStatus(organizationId, deviceId, routineStepId, PIPELINE_STATUS.IN_PROGRESS, localTimeStamp);
  }

  @OnEvent(OnStepCompletedEvent.key)
  async onStepCompleted(value: Instance<typeof OnStepCompletedEvent.value>): Promise<void> {
    const { organizationId, deviceId, routineStepId, stepStatus, localTimeStamp } = value;
    await this.updateStepStatus(organizationId, deviceId, routineStepId, stepStatus, localTimeStamp);
  }

  @Retry({ printable: logger })
  private async updateStepStatus(organizationId: OrganizationId, deviceId: DeviceId, routineStepId: RoutineStepId, status: PIPELINE_STATUS, localTimeStamp: Date): Promise<void> {
    const pathProvider = new PrivateStep.updateStepStatus.pathProvider(organizationId, deviceId, routineStepId);
    const path = PrivateStep.updateStepStatus.resolvePath(pathProvider);
    const requestBody: Instance<typeof PrivateStep.updateStepStatus.requestBody> = {
      status,
      localTimeStamp,
    };
    try {
      await this.consoleClientService.client.patch(path, requestBody, {
        ...createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
        timeout: DefaultHttpOptions.request.timeout,
      });
    } catch (error) {
      this.logger.error('Failed to update step status', {
        organizationId,
        deviceId,
        routineStepId,
        status,
        error: errorify(error),
      });
      throw error;
    }
    this.logger.verbose('Step status updated', { organizationId, deviceId, routineStepId, status });
  }
}
