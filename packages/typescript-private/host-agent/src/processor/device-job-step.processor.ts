import { CancelDeviceJob, ErrorResult, RunDeviceJob, RunStep, RunStepValue } from '@dogu-private/console-host-agent';
import { Code, CodeUtil, DEVICE_JOB_LOG_TYPE, ErrorResultError, PIPELINE_STATUS, platformTypeFromPlatform, StepContextEnv } from '@dogu-private/types';
import { delay, errorify, Instance, validateAndEmitEventAsync } from '@dogu-tech/common';
import { EnvironmentVariableReplacementProvider, HostPaths } from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import fs from 'fs';
import { delimiter } from 'path';
import { DeviceJobContextRegistry } from '../device-job/device-job.context-registry';
import {
  OnDeviceJobCancelRequestedEvent,
  OnDeviceJobCompletedEvent,
  OnDeviceJobLoggedEvent,
  OnDeviceJobPrePocessStartedEvent,
  OnDeviceJobStartedEvent,
} from '../device-job/device-job.events';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { MessageContext, NullMessagePostProcessor } from '../message/message.types';
import { optionsConfig } from '../options-config.instance';
import { OnStepCompletedEvent, OnStepInProgressEvent, OnStepStartedEvent } from '../step/step.events';
import { StepMessageContext } from '../step/step.types';

@Injectable()
export class DeviceJobStepProcessor {
  constructor(private readonly logger: DoguLogger, private readonly eventEmitter: EventEmitter2, private readonly deviceJobContextRegistry: DeviceJobContextRegistry) {}

  async onRunDeviceJob(param: RunDeviceJob, context: MessageContext): Promise<void> {
    const { routineDeviceJobId, record, runSteps } = param;
    const { info, router } = context;
    const { organizationId, deviceId, serial, recordWorkspacePath, platform } = info;
    const recordSerialPath = HostPaths.recordSerialPath(recordWorkspacePath, serial);
    await fs.promises.mkdir(recordSerialPath, { recursive: true });
    this.logger.info(`DeviceJob ${routineDeviceJobId} started on device ${serial}`);
    const deviceJobLocalStartedAt = new Date();

    try {
      await validateAndEmitEventAsync(this.eventEmitter, OnDeviceJobPrePocessStartedEvent, {
        organizationId,
        deviceId,
        routineDeviceJobId,
        localStartedAt: deviceJobLocalStartedAt,
      });
    } catch (error) {
      this.logger.error(`DeviceJobContextRegistry: error while emitting OnDeviceJobPrePocessStartedEvent`, { error: errorify(error) });
    }

    await validateAndEmitEventAsync(this.eventEmitter, OnDeviceJobStartedEvent, {
      organizationId,
      deviceId,
      routineDeviceJobId,
      recordSerialPath,
      record,
      serial,
      platform,
      stepStatusInfos: runSteps.map((runStep) => {
        return { stepStatus: PIPELINE_STATUS.UNSPECIFIED, localStartedAt: null, localCompletedAt: null };
      }),
    });
    this.logger.info(`DeviceJob ${routineDeviceJobId} started event emitted on device ${serial}`);
    try {
      for (const runStep of runSteps) {
        if (this.deviceJobContextRegistry.cancelRequested(organizationId, deviceId, routineDeviceJobId)) {
          this.logger.info(`DeviceJob ${routineDeviceJobId} canceled on device ${serial}`);
          break;
        }
        try {
          const errorResult = await router.route<RunStep, ErrorResult>(runStep, context);
          if (CodeUtil.isNotSuccess(errorResult.value.code)) {
            this.logger.error('step failed', { errorResult });
            break;
          }
        } catch (error) {
          this.logger.error('step error occurred', { error: errorify(error) });
          break;
        }
      }
    } catch (error) {
      this.logger.error('Error while routing runSteps', { error: errorify(error) });
    }
    this.logger.info(`DeviceJob ${routineDeviceJobId} completed on device ${serial}`);
    try {
      await validateAndEmitEventAsync(this.eventEmitter, OnDeviceJobCompletedEvent, {
        organizationId,
        deviceId,
        routineDeviceJobId,
        record,
        localStartedAt: deviceJobLocalStartedAt,
        localCompletedAt: new Date(),
      });
    } catch (error) {
      this.logger.error('Error while emitting OnDeviceJobCompletedEvent', { error: errorify(error) });
    }
    this.logger.info(`DeviceJob ${routineDeviceJobId} completed event emitted on device ${serial}`);
  }

  async onCancelDeviceJob(param: CancelDeviceJob, context: MessageContext): Promise<void> {
    const { routineDeviceJobId, record } = param;
    const { info } = context;
    const { organizationId, deviceId } = info;
    this.logger.info(`DeviceJob ${routineDeviceJobId} cancel requested`);
    try {
      await validateAndEmitEventAsync(this.eventEmitter, OnDeviceJobCancelRequestedEvent, {
        organizationId,
        deviceId,
        routineDeviceJobId,
        record,
      });
    } catch (error) {
      this.logger.error('Error while emitting OnDeviceJobCancelRequestedEvent', { error: errorify(error) });
    }
    this.logger.info(`DeviceJob ${routineDeviceJobId} cancel requested event emitted`);
  }

  async onRunStep(param: RunStep, context: MessageContext): Promise<ErrorResult> {
    const { routineStepId, env: stepEnv, value, organizationId, deviceId, routineDeviceJobId, stepIndex, projectId } = param;
    const { info, router, environmentVariableReplacer } = context;
    const { platform, serial, deviceWorkspacePath, rootWorkspacePath, hostPlatform, hostWorkspacePath, pathMap } = info;
    this.logger.info(`Step ${routineStepId} started`);
    try {
      await validateAndEmitEventAsync(this.eventEmitter, OnStepStartedEvent, {
        organizationId,
        deviceId,
        routineDeviceJobId,
        routineStepId,
        localTimeStamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Error while emitting OnStepStartedEvent', { error: errorify(error) });
    }
    this.logger.info(`Step ${routineStepId} started event emitted`);
    const stepEnvReplaced = await environmentVariableReplacer.replaceEnv(stepEnv);
    environmentVariableReplacer.stackProvider.push(new EnvironmentVariableReplacementProvider(stepEnvReplaced));
    const deviceServerHostPort = env.DOGU_DEVICE_SERVER_HOST_PORT.split(':');
    if (deviceServerHostPort.length !== 2) {
      throw new Error('DOGU_DEVICE_SERVER_HOST_PORT must be in format host:port');
    }
    const { nodeBin, gitLibexecGitCore } = pathMap.common;
    const organizationWorkspacePath = HostPaths.organizationWorkspacePath(rootWorkspacePath, organizationId);
    await fs.promises.mkdir(organizationWorkspacePath, { recursive: true });
    const deviceProjectWorkspacePath = HostPaths.deviceProjectWorkspacePath(deviceWorkspacePath, projectId);
    await fs.promises.mkdir(deviceProjectWorkspacePath, { recursive: true });
    const stepContextEnv: StepContextEnv = {
      DOGU_DEVICE_PLATFORM: platformTypeFromPlatform(platform),
      DOGU_DEVICE_PROJECT_WORKSPACE_PATH: deviceProjectWorkspacePath,
      DOGU_DEVICE_SERIAL: serial,
      DOGU_DEVICE_ID: deviceId,
      DOGU_DEVICE_SERVER_PORT: deviceServerHostPort[1],
      DOGU_DEVICE_JOB_ID: `${routineDeviceJobId}`,
      DOGU_DEVICE_WORKSPACE_PATH: deviceWorkspacePath,
      DOGU_ORGANIZATION_ID: organizationId,
      DOGU_ORGANIZATION_WORKSPACE_PATH: organizationWorkspacePath,
      DOGU_PROJECT_ID: projectId,
      DOGU_STEP_ID: `${routineStepId}`,
      DOGU_API_BASE_URL: env.DOGU_API_BASE_URL,
      DOGU_LOG_LEVEL: optionsConfig.get('logLevel', 'verbose'),
      DOGU_ROOT_WORKSPACE_PATH: rootWorkspacePath,
      DOGU_HOST_PLATFORM: platformTypeFromPlatform(hostPlatform),
      DOGU_HOST_WORKSPACE_PATH: hostWorkspacePath,
      DOGU_HOST_TOKEN: env.DOGU_HOST_TOKEN,
      DOGU_RUN_TYPE: env.DOGU_RUN_TYPE,
      PATH: `${gitLibexecGitCore}${delimiter}${nodeBin}${delimiter}$PATH`,
    };
    const stepContextEnvReplaced = await environmentVariableReplacer.replaceEnv(stepContextEnv);
    environmentVariableReplacer.stackProvider.push(new EnvironmentVariableReplacementProvider(stepContextEnvReplaced));
    const deviceProjectGitPath = HostPaths.deviceProjectGitPath(deviceProjectWorkspacePath);
    await fs.promises.mkdir(deviceProjectGitPath, { recursive: true });
    const stepMessageContext = new StepMessageContext(
      info,
      router,
      environmentVariableReplacer,
      {
        onLog: (log): void => {
          const value: Instance<typeof OnDeviceJobLoggedEvent.value> = {
            organizationId,
            deviceId,
            routineDeviceJobId,
            log: { ...log, type: DEVICE_JOB_LOG_TYPE.USER_PROJECT },
          };
          validateAndEmitEventAsync(this.eventEmitter, OnDeviceJobLoggedEvent, value).catch((error) => {
            this.logger.error('Failed to emit device job logged event', { error: errorify(error) });
          });
          const { level, message, details, localTimeStamp } = log;
          if (level === 'error') {
            this.logger.error(message, { details, localTimeStamp });
          } else if (level === 'warn') {
            this.logger.warn(message, { details, localTimeStamp });
          } else if (level === 'info') {
            this.logger.info(message, { details, localTimeStamp });
          } else if (level === 'debug') {
            this.logger.debug(message, { details, localTimeStamp });
          } else if (level === 'verbose') {
            this.logger.verbose(message, { details, localTimeStamp });
          } else {
            this.logger.info(message, { details, localTimeStamp });
          }
        },
        onCancelerCreated: (canceler): void => {
          const value: Instance<typeof OnStepInProgressEvent.value> = {
            organizationId,
            deviceId,
            routineStepId,
            routineDeviceJobId,
            messageCanceler: canceler,
            messagePostProcessor: NullMessagePostProcessor,
            stepIndex,
            localTimeStamp: new Date(),
          };
          validateAndEmitEventAsync(this.eventEmitter, OnStepInProgressEvent, value).catch((error) => {
            this.logger.error('Failed to emit step in progress event', { error: errorify(error) });
          });
        },
      },
      deviceProjectGitPath,
    );
    const result = await router.route<RunStepValue, ErrorResult>(value, stepMessageContext).catch((error) => {
      const errorified = errorify(error);
      this.logger.error('Error while routing runStep', { error: errorified });
      const errorResult: ErrorResult = {
        kind: 'ErrorResult',
        value: {
          code: Code.CODE_HOST_AGENT_UNEXPECTED_ERROR,
          message: errorified.message,
          details: {
            stack: errorified.stack,
            cause: errorified.cause,
          },
        },
      };
      return errorResult;
    });
    const { code, message, details } = result.value;
    this.logger.info(`Step ${routineStepId} completed`);
    try {
      await delay(10); // padding for log missing. (If last log time and step complete time is same )
      await validateAndEmitEventAsync(this.eventEmitter, OnStepCompletedEvent, {
        organizationId,
        deviceId,
        routineDeviceJobId,
        routineStepId,
        stepIndex,
        stepStatus:
          code === Code.CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED
            ? PIPELINE_STATUS.SUCCESS
            : code === Code.CODE_HOST_AGENT_SIGTERM
            ? PIPELINE_STATUS.CANCELLED
            : PIPELINE_STATUS.FAILURE,
        error: new ErrorResultError(code, message, details),
        localTimeStamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Error while emitting OnStepCompletedEvent', { error: errorify(error) });
    }
    this.logger.info(`Step ${routineStepId} completed event emitted`);
    return result;
  }
}
