import { DeviceId, LocalDeviceDetectToken, OrganizationId, Serial } from '@dogu-private/types';
import { Instance, stringify } from '@dogu-tech/common';
import { Device, DeviceInstallApp, DeviceJoinWifi, DeviceReset, DeviceRunApp, DeviceStreaming, StreamingAnswerDto } from '@dogu-tech/device-client-common';
import { Injectable } from '@nestjs/common';
import { env } from '../../../env';
import { DeviceMessageRelayer } from '../../device-message/device-message.relayer';
import { DoguLogger } from '../../logger/logger';
import { DeviceStreamingOfferDto } from './dto/device.dto';

@Injectable()
export class DeviceCommandService {
  constructor(private readonly deviceMessageRelayer: DeviceMessageRelayer, private readonly logger: DoguLogger) {}

  /**
   * Not using due to trickle running on websocket
   */
  async startDeviceStreaming(offer: DeviceStreamingOfferDto): Promise<Instance<typeof Device.startDeviceStreaming.responseBodyData>> {
    const { organizationId, deviceId, serial, ...rest } = offer;
    const pathProvider = new Device.startDeviceStreaming.pathProvider(serial);
    const path = Device.startDeviceStreaming.resolvePath(pathProvider);
    const requestBody: Instance<typeof DeviceStreaming.sendMessage> = {
      serial,
      ...rest,
    };
    const responseBody = await this.deviceMessageRelayer.sendHttpRequest(
      organizationId,
      deviceId,
      Device.startDeviceStreaming.method,
      path,
      {
        'Content-Type': 'application/json',
      },
      undefined,
      requestBody,
      Device.startDeviceStreaming.responseBodyData,
    );
    return responseBody;
  }

  async *startDeviceStreamingWithTrickle(offer: DeviceStreamingOfferDto): AsyncGenerator<StreamingAnswerDto> {
    const { organizationId, deviceId, serial, ...rest } = offer;
    const proxy = await this.deviceMessageRelayer.connectWebSocket(organizationId, deviceId, DeviceStreaming);
    await proxy.send({
      serial,
      ...rest,
    });
    for await (const data of proxy.receive()) {
      yield data;
    }
  }

  async installApp(organizationId: OrganizationId, deviceId: DeviceId, serial: Serial, appPath: string): Promise<void> {
    const proxy = await this.deviceMessageRelayer.connectWebSocket(organizationId, deviceId, DeviceInstallApp);
    return proxy.send({
      serial,
      appPath,
    });
  }

  async runApp(organizationId: OrganizationId, deviceId: DeviceId, serial: Serial, appPath: string): Promise<void> {
    const proxy = await this.deviceMessageRelayer.connectWebSocket(organizationId, deviceId, DeviceRunApp);
    return proxy.send({
      serial,
      appPath,
    });
  }

  reboot(organizationId: OrganizationId, deviceId: DeviceId, serial: Serial): void {
    const pathProvider = new Device.rebootDevice.pathProvider(serial);
    const path = Device.rebootDevice.resolvePath(pathProvider);
    this.deviceMessageRelayer
      .sendHttpRequest(organizationId, deviceId, Device.rebootDevice.method, path, undefined, undefined, undefined, Device.rebootDevice.responseBodyData)
      .catch((error) => {
        this.logger.verbose(`DeviceCommandService.reboot. ignore error: ${stringify(error)}`);
      });
  }

  async findLocalDeviceDetectTokens(organizationId: OrganizationId, deviceId: DeviceId, serial: Serial): Promise<LocalDeviceDetectToken[]> {
    const pathProvider = new Device.getLocalDeviceDetectToken.pathProvider(serial);
    const path = Device.getLocalDeviceDetectToken.resolvePath(pathProvider);
    const res = await this.deviceMessageRelayer.sendHttpRequest(
      organizationId,
      deviceId,
      Device.getLocalDeviceDetectToken.method,
      path,
      undefined,
      undefined,
      undefined,
      Device.getLocalDeviceDetectToken.responseBodyData,
    );
    return res.tokens;
  }

  async resetAndJoinWifi(organizationId: OrganizationId, deviceId: DeviceId, serial: Serial): Promise<void> {
    const resetProxy = await this.deviceMessageRelayer.connectWebSocket(organizationId, deviceId, DeviceReset);
    await resetProxy.send({
      serial,
    });
    this.logger.info(`DeviceCommandService.resetAndJoinWifi. reset sent`);
    try {
      for await (const _ of resetProxy.receive()) {
      }
    } catch (error) {
      this.logger.error(`DeviceCommandService.resetAndJoinWifi. reset error: ${stringify(error)}`);
    }
    this.logger.info(`DeviceCommandService.resetAndJoinWifi. reset done`);
    const joinWifiProxy = await this.deviceMessageRelayer.connectWebSocket(organizationId, deviceId, DeviceJoinWifi);
    this.logger.info(`DeviceCommandService.resetAndJoinWifi. joinWifi connecting`);
    await joinWifiProxy.send({
      serial,
      ssid: env.DOGU_WIFI_SSID,
      password: env.DOGU_WIFI_PASSWORD,
    });
    this.logger.info(`DeviceCommandService.resetAndJoinWifi. joinWifi sent`);
    for await (const _ of joinWifiProxy.receive()) {
    }
    this.logger.info(`DeviceCommandService.resetAndJoinWifi. joinWifi done`);
  }
}
