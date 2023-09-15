import { parseEventResult, RunStep, RunStepValue } from '@dogu-private/console-host-agent';
import { BrowserName, DeviceId, DeviceRunnerId, OrganizationId, ProjectId } from '@dogu-private/types';
import { stringify } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';

import { RoutineDeviceJob } from '../../../../db/entity/device-job.entity';
import { RoutineStep } from '../../../../db/entity/step.entity';
import { DeviceMessageRelayer } from '../../../device-message/device-message.relayer';
import { DoguLogger } from '../../../logger/logger';

@Injectable()
export class DeviceJobMessenger {
  constructor(
    private readonly deviceMessageRelayer: DeviceMessageRelayer,
    private readonly logger: DoguLogger,
  ) {}

  async sendRunDeviceJob(organizationId: OrganizationId, deviceId: DeviceId, deviceJob: RoutineDeviceJob): Promise<void> {
    const {
      routineDeviceJobId,
      record,
      device,
      routineSteps: steps,
      routineJob,
      deviceRunnerId,
      appVersion: appVersionRaw,
      browserName: browserNameRaw,
      browserVersion: browserVersionRaw,
      appPackageName: appPackageNameRaw,
    } = deviceJob;
    const appVersion = appVersionRaw ?? undefined;
    const browserName = browserNameRaw ?? undefined;
    const browserVersion = browserVersionRaw ?? undefined;
    const appPackageName = appPackageNameRaw ?? undefined;

    if (!device) {
      throw new Error(`Device not found: ${stringify(deviceJob)}`);
    }

    if (!deviceRunnerId) {
      throw new Error(`DeviceRunner not found: ${stringify(deviceJob)}`);
    }

    const { serial } = device;
    if (!routineJob) {
      throw new Error(`Job not found: ${stringify(deviceJob)}`);
    }
    const { routinePipeline: pipeline } = routineJob;
    if (!pipeline) {
      throw new Error(`Pipeline not found: ${stringify(deviceJob)}`);
    }
    const { projectId } = pipeline;
    const runSteps =
      steps?.map((step) => this.stepToRunStep(organizationId, deviceId, projectId, deviceRunnerId, step, appVersion, appPackageName, browserName, browserVersion)) ?? [];
    const result = await this.deviceMessageRelayer.sendParam(organizationId, deviceId, {
      kind: 'EventParam',
      value: {
        kind: 'RunDeviceJob',
        routineDeviceJobId,
        deviceRunnerId,
        record,
        serial,
        runSteps,
        appPackageName,
      },
    });
    parseEventResult(result);
  }

  async sendCancelDeviceJob(organizationId: OrganizationId, deviceId: DeviceId, deviceJob: RoutineDeviceJob): Promise<void> {
    const { routineDeviceJobId, record } = deviceJob;
    const result = await this.deviceMessageRelayer.sendParam(organizationId, deviceId, {
      kind: 'EventParam',
      value: {
        kind: 'CancelDeviceJob',
        routineDeviceJobId,
        record,
      },
    });
    parseEventResult(result);
  }

  private stepToRunStep(
    organizationId: OrganizationId,
    deviceId: DeviceId,
    projectId: ProjectId,
    deviceRunnerId: DeviceRunnerId,
    step: RoutineStep,
    appVersion?: string,
    appPackageName?: string,
    browserName?: BrowserName,
    browserVersion?: string,
  ): RunStep {
    const { env, routineStepId, routineDeviceJobId: deviceJobId, index, cwd } = step;
    const runStepValue = this.stepToRunStepValue(step);
    return {
      kind: 'RunStep',
      organizationId,
      projectId,
      deviceId,
      deviceRunnerId,
      routineDeviceJobId: deviceJobId,
      routineStepId,
      stepIndex: index,
      env: env ?? {},
      value: runStepValue,
      cwd,
      appVersion,
      appPackageName,
      browserName,
      browserVersion,
    };
  }

  private stepToRunStepValue(step: RoutineStep): RunStepValue {
    const { uses, run, with: with_ } = step;
    if (uses !== null) {
      return {
        kind: 'Action',
        actionId: uses,
        inputs: with_ ?? {},
      };
    } else if (run !== null) {
      return {
        kind: 'Run',
        run,
      };
    }
    throw new Error(`Unexpected step ${stringify(step)}`);
  }
}
