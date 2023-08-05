import { ErrorResult, Param, ParamValue, PrivateDevice, Result, ResultValue } from '@dogu-private/console-host-agent';
import { Code, createConsoleApiAuthHeader, DeviceId, OrganizationId } from '@dogu-private/types';
import { DefaultHttpOptions, DuplicatedCallGuarder, errorify, Instance, transformAndValidate } from '@dogu-tech/common';
import { MultiPlatformEnvironmentVariableReplacer } from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { config } from '../config';
import { ConsoleClientService } from '../console-client/console-client.service';
import { DeviceRegistry } from '../device/device.registry';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { DeviceResolutionInfo, MessageHandlers, MessageInfo } from '../types';
import { MessageRouter } from './message.router';
import { MessageContext, NullMessageEventHandler } from './message.types';

@Injectable()
export class MessagePuller {
  private readonly pullDuplicatedCallGuader = new DuplicatedCallGuarder();
  private messageHandlers: MessageHandlers | null = null;

  constructor(private readonly consoleClientService: ConsoleClientService, private readonly deviceRegistry: DeviceRegistry, private readonly logger: DoguLogger) {}

  @Interval(config.device.message.pull.intervalMilliseconds)
  async onPull(): Promise<void> {
    try {
      await this.pullDuplicatedCallGuader.guard(() => {
        const { devices } = this.deviceRegistry;
        const count = config.device.message.pull.count;
        devices.forEach((deviceResolutionInfo, serial) => {
          this.pullDeviceParamDatas(deviceResolutionInfo, count).catch((error) => {
            this.logger.error('pull device param datas failed', {
              serial,
              error: errorify(error),
            });
          });
        });
      });
    } catch (error) {
      this.logger.error('pull message failed', {
        error: errorify(error),
      });
    }
  }

  setMessageHandlers(handlers: MessageHandlers): void {
    this.messageHandlers = handlers;
  }

  private async pullDeviceParamDatas(deviceResolutionInfo: DeviceResolutionInfo, count: number): Promise<void> {
    const { deviceId, organizationId } = deviceResolutionInfo;
    const pathProvider = new PrivateDevice.pullDeviceParamDatas.pathProvider(organizationId, deviceId);
    const path = PrivateDevice.pullDeviceParamDatas.resolvePath(pathProvider);
    const requestBody: Instance<typeof PrivateDevice.pullDeviceParamDatas.requestBody> = { count };
    const { data } = await this.consoleClientService.client
      .post<Instance<typeof PrivateDevice.pullDeviceParamDatas.responseBody>>(path, requestBody, {
        ...createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
        timeout: DefaultHttpOptions.request.timeout,
      })
      .catch((error) => {
        this.logger.error('pull device param datas failed', {
          organizationId,
          deviceId,
          error: errorify(error),
        });
        throw error;
      });
    const response = await transformAndValidate(PrivateDevice.pullDeviceParamDatas.responseBody, data);
    const { datas, timeStamps } = response;
    datas.forEach((data) => {
      this.processParamData(deviceResolutionInfo, data, timeStamps).catch((error) => {
        this.logger.error('process param data failed', {
          deviceResolutionInfo,
          data,
          error: errorify(error),
        });
      });
    });
  }

  private async processParamData(deviceResolutionInfo: DeviceResolutionInfo, paramData: string, pulledTimeStamps: string[]): Promise<void> {
    this.logger.verbose('process param data', {
      deviceResolutionInfo,
      paramData,
    });

    const { deviceId, organizationId } = deviceResolutionInfo;
    const param = await transformAndValidate(Param, JSON.parse(paramData));
    const { resultId, value, timeStamps } = param;

    const messageInfo: MessageInfo = {
      ...deviceResolutionInfo,
    };

    if (this.messageHandlers === null) {
      throw new Error('message handlers not set');
    }

    const resultValue = await this.processParam(messageInfo, value, this.messageHandlers);
    const result: Result = {
      value: resultValue,
      timeStamps: [...timeStamps, ...pulledTimeStamps, `ha_processParam-${Date.now()}`],
    };
    await this.sendResult(organizationId, deviceId, resultId, result);
  }

  private async processParam(messageInfo: MessageInfo, paramValue: ParamValue, messageHandlers: MessageHandlers): Promise<ResultValue> {
    const router = new MessageRouter(messageHandlers);
    const context = new MessageContext(messageInfo, router, new MultiPlatformEnvironmentVariableReplacer(), NullMessageEventHandler);
    try {
      const resultValue = await router.route<ParamValue, ResultValue>(paramValue, context);
      return resultValue;
    } catch (error) {
      const errorResult: ErrorResult = {
        kind: 'ErrorResult',
        value: {
          code: Code.CODE_HOST_AGENT_DEVICE_REQUEST_FAILED,
          message: 'device request failed',
          details: {
            error,
          },
        },
      };
      return errorResult;
    }
  }

  private async sendResult(organizationId: OrganizationId, deviceId: DeviceId, resultId: string, result: Result): Promise<void> {
    const pathProvider = new PrivateDevice.pushDeviceResult.pathProvider(organizationId, deviceId, resultId);
    const path = PrivateDevice.pushDeviceResult.resolvePath(pathProvider);
    const requestBody: Instance<typeof PrivateDevice.pushDeviceResult.requestBody> = {
      result,
    };
    await this.consoleClientService.client
      .post<Instance<typeof PrivateDevice.pushDeviceResult.requestBody>>(path, requestBody, createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN))
      .catch((error) => {
        this.logger.error('push device result failed', {
          organizationId,
          deviceId,
          resultId,
          error: errorify(error),
        });
        throw error;
      });
  }
}
