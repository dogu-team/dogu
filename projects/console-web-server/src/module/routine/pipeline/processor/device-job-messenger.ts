import { parseEventResult, RunStep, RunStepValue } from '@dogu-private/console-host-agent';
import { DeviceId, OrganizationId, ProjectId } from '@dogu-private/types';
import { stringify } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { RoutineDeviceJob } from '../../../../db/entity/device-job.entity';
import { RoutineStep } from '../../../../db/entity/step.entity';
import { DeviceMessageRelayer } from '../../../device-message/device-message.relayer';
import { DoguLogger } from '../../../logger/logger';

@Injectable()
export class DeviceJobMessenger {
  constructor(private readonly deviceMessageRelayer: DeviceMessageRelayer, private readonly logger: DoguLogger) {}

  async sendRunDeviceJob(organizationId: OrganizationId, deviceId: DeviceId, deviceJob: RoutineDeviceJob): Promise<void> {
    const { routineDeviceJobId, record, device, routineSteps: steps, routineJob } = deviceJob;
    const { serial } = device;
    if (!routineJob) {
      throw new Error(`Job not found: ${stringify(deviceJob)}`);
    }
    const { routinePipeline: pipeline } = routineJob;
    if (!pipeline) {
      throw new Error(`Pipeline not found: ${stringify(deviceJob)}`);
    }
    const { projectId } = pipeline;
    const runSteps = steps?.map((step) => this.stepToRunStep(organizationId, deviceId, projectId, step)) ?? [];
    const result = await this.deviceMessageRelayer.sendParam(organizationId, deviceId, {
      kind: 'EventParam',
      value: {
        kind: 'RunDeviceJob',
        routineDeviceJobId,
        record,
        serial,
        runSteps,
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

  private stepToRunStep(organizationId: OrganizationId, deviceId: DeviceId, projectId: ProjectId, step: RoutineStep): RunStep {
    const { env, routineStepId, routineDeviceJobId: deviceJobId, index } = step;
    const runStepValue = this.stepToRunStepValue(step);
    return {
      kind: 'RunStep',
      organizationId,
      projectId,
      deviceId,
      routineDeviceJobId: deviceJobId,
      routineStepId,
      stepIndex: index,
      env: env ?? {},
      value: runStepValue,
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
