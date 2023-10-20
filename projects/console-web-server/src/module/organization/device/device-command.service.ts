import { WebSocketProxyReceiveClose } from '@dogu-private/console-host-agent';
import { DeviceId, LocalDeviceDetectToken, OrganizationId, Serial } from '@dogu-private/types';
import { HeaderRecord, stringify } from '@dogu-tech/common';
import {
  Device,
  DeviceInstallApp,
  DeviceReset,
  DeviceRunApp,
  DeviceStreaming,
  DeviceTcpRelay,
  DoguDeviceTcpRelayPortHeaderKey,
  DoguDeviceTcpRelaySerialHeaderKey,
  StreamingAnswerDto,
  TcpRelayRequest,
  TcpRelayResponse,
} from '@dogu-tech/device-client-common';
import { Injectable } from '@nestjs/common';
import { DeviceMessageRelayer, WebSocketProxy } from '../../device-message/device-message.relayer';
import { DoguLogger } from '../../logger/logger';
import { DeviceStreamingOfferDto } from './dto/device.dto';

@Injectable()
export class DeviceCommandService {
  constructor(private readonly deviceMessageRelayer: DeviceMessageRelayer, private readonly logger: DoguLogger) {}

  async *startDeviceStreamingWithTrickle(offer: DeviceStreamingOfferDto): AsyncGenerator<StreamingAnswerDto | WebSocketProxyReceiveClose> {
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
      .sendHttpRequest(organizationId, deviceId, Device.rebootDevice.method, path, undefined, undefined, undefined, Device.rebootDevice.responseBody)
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

  async reset(organizationId: OrganizationId, deviceId: DeviceId, serial: Serial): Promise<void> {
    const resetProxy = await this.deviceMessageRelayer.connectWebSocket(organizationId, deviceId, DeviceReset);
    await resetProxy.send({
      serial,
    });
    this.logger.info(`DeviceCommandService.reset. reset sent`);
    try {
      for await (const _ of resetProxy.receive()) {
      }
    } catch (error) {
      this.logger.error(`DeviceCommandService.reset. reset error: ${stringify(error)}`);
    }
    this.logger.info(`DeviceCommandService.reset. reset done`);
  }

  async relayTcp(organizationId: OrganizationId, deviceId: DeviceId, serial: Serial, port: number): Promise<WebSocketProxy<typeof TcpRelayRequest, typeof TcpRelayResponse>> {
    const headers: HeaderRecord = {};
    headers[DoguDeviceTcpRelaySerialHeaderKey] = serial;
    headers[DoguDeviceTcpRelayPortHeaderKey] = port.toString();
    return await this.deviceMessageRelayer.connectWebSocket(organizationId, deviceId, DeviceTcpRelay, headers);
  }
}
