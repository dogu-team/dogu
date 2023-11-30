import { OnWebSocketClose, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { DeviceConnectionState, Platform, platformFromPlatformType } from '@dogu-private/types';
import { Instance, validateAndEmitEventAsync } from '@dogu-tech/common';
import { DefaultDeviceConnectionSubscribeReceiveMessage, DeviceConnectionSubscribe } from '@dogu-tech/device-client-common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { AuthIncomingMessage, DeviceWsPermission } from '../../auth/guard/device.ws.guard';
import { BrowserManagerService } from '../../browser-manager/browser-manager.service';
import {
  OnDeviceConnectionSubscriberConnectedEvent,
  OnDeviceConnectionSubscriberDisconnectedEvent,
  OnDevicesConnectedEvent,
  OnDevicesConnectingEvent,
  OnDevicesDisconnectedEvent,
  OnDevicesErrorEvent,
} from '../../events';
import { DoguLogger } from '../../logger/logger';

@WebSocketService(DeviceConnectionSubscribe)
export class DeviceConnectionSubscribeService
  extends WebSocketGatewayBase<null, typeof DeviceConnectionSubscribe.sendMessage, typeof DeviceConnectionSubscribe.receiveMessage>
  implements OnWebSocketClose<null>
{
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: DoguLogger,
    private readonly browserManagerService: BrowserManagerService,
  ) {
    super(DeviceConnectionSubscribe, logger);
  }

  @OnEvent(OnDevicesConnectingEvent.key)
  onDevicesConnecting(value: Instance<typeof OnDevicesConnectingEvent.value>): void {
    const messages = value.platformSerials.map((platformSerial) => {
      const { serial, platform, model } = platformSerial;
      const message: Instance<typeof DeviceConnectionSubscribe.receiveMessage> = {
        ...DefaultDeviceConnectionSubscribeReceiveMessage(),
        serial: serial,
        model,
        platform: platformFromPlatformType(platform),
        state: DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTING,
      };
      return message;
    });
    messages.forEach((message) => this.notify(message));
  }

  @OnEvent(OnDevicesErrorEvent.key)
  onDevicesError(value: Instance<typeof OnDevicesErrorEvent.value>): void {
    const messages = value.errorDevices.map((errorDevice) => {
      const { serial, platform, model, error } = errorDevice;
      const message: Instance<typeof DeviceConnectionSubscribe.receiveMessage> = {
        ...DefaultDeviceConnectionSubscribeReceiveMessage(),
        serial: serial,
        model: model,
        platform: platformFromPlatformType(platform),
        state: DeviceConnectionState.DEVICE_CONNECTION_STATE_ERROR,
        errorMessage: error.message,
      };
      return message;
    });
    messages.forEach((message) => this.notify(message));
  }

  @OnEvent(OnDevicesConnectedEvent.key)
  onDevicesConnected(value: Instance<typeof OnDevicesConnectedEvent.value>): void {
    const messages = value.channels.map((channel) => {
      const { serial, serialUnique, platform, info, isVirtual, browserInstallations } = channel;
      const { system, version, graphics } = info;
      const { model, manufacturer } = system;
      const biggestDisplay = graphics.displays.reduce((a, b) => (a.resolutionX * a.resolutionY < b.resolutionX * b.resolutionY ? b : a), { resolutionX: 0, resolutionY: 0 });
      const resolutionWidth = biggestDisplay?.resolutionX ?? 0;
      const resolutionHeight = biggestDisplay?.resolutionY ?? 0;
      const memory = `${info.memLayout.at(0)?.size ?? 0}`;

      const message: Instance<typeof DeviceConnectionSubscribe.receiveMessage> = {
        serial,
        serialUnique,
        platform,
        model,
        version,
        state: DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED,
        errorMessage: '',
        manufacturer,
        isVirtual: isVirtual ? 1 : 0,
        resolutionWidth,
        resolutionHeight,
        memory,
        browserInstallations,
      };
      return message;
    });
    messages.forEach((message) => this.notify(message));
  }

  @OnEvent(OnDevicesDisconnectedEvent.key)
  onDevicesDisconnected(value: Instance<typeof OnDevicesDisconnectedEvent.value>): void {
    const messages = value.serials.map((serial) => {
      const message: Instance<typeof DeviceConnectionSubscribe.receiveMessage> = {
        ...DefaultDeviceConnectionSubscribeReceiveMessage(),
        serial: serial,
        platform: Platform.PLATFORM_UNSPECIFIED,
        state: DeviceConnectionState.DEVICE_CONNECTION_STATE_DISCONNECTED,
      };
      return message;
    });
    messages.forEach((message) => this.notify(message));
  }

  @DeviceWsPermission()
  override async onWebSocketOpen(webSocket: WebSocket, @AuthIncomingMessage() incommingMessage: IncomingMessage): Promise<null> {
    await validateAndEmitEventAsync(this.eventEmitter, OnDeviceConnectionSubscriberConnectedEvent, {
      webSocket,
    });
    return null;
  }

  async onWebSocketClose(webSocket: WebSocket, event: WebSocket.CloseEvent, valueAccessor: WebSocketRegistryValueAccessor<null>): Promise<void> {
    await validateAndEmitEventAsync(this.eventEmitter, OnDeviceConnectionSubscriberDisconnectedEvent, {
      webSocket,
    });
  }
}
