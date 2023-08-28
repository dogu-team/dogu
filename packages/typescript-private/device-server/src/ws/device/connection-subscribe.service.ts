import { OnWebSocketClose, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { DeviceConnectionState, Platform } from '@dogu-private/types';
import { Instance, validateAndEmitEventAsync } from '@dogu-tech/common';
import { DeviceConnectionSubscribe } from '@dogu-tech/device-client-common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { BrowserManagerService } from '../../browser-manager/browser-manager.service';
import { OnDeviceConnectionSubscriberConnectedEvent, OnDeviceConnectionSubscriberDisconnectedEvent, OnDevicesConnectedEvent, OnDevicesDisconnectedEvent } from '../../events';
import { DoguLogger } from '../../logger/logger';

@WebSocketService(DeviceConnectionSubscribe)
export class DeviceConnectionSubscribeService
  extends WebSocketGatewayBase<null, typeof DeviceConnectionSubscribe.sendMessage, typeof DeviceConnectionSubscribe.receiveMessage>
  implements OnWebSocketClose<null>
{
  constructor(private readonly eventEmitter: EventEmitter2, private readonly logger: DoguLogger, private readonly browserManagerService: BrowserManagerService) {
    super(DeviceConnectionSubscribe, logger);
  }

  @OnEvent(OnDevicesConnectedEvent.key)
  onDevicesConnected(value: Instance<typeof OnDevicesConnectedEvent.value>): void {
    const messages = value.channels.map((channel) => {
      const { serial, serialUnique, platform, info, isVirtual, installedBrowserInfos } = channel;
      const { system, version, graphics } = info;
      const { model, manufacturer } = system;
      const display = graphics.displays.at(0);
      const resolutionWidth = display?.resolutionX ?? 0;
      const resolutionHeight = display?.resolutionY ?? 0;

      const message: Instance<typeof DeviceConnectionSubscribe.receiveMessage> = {
        serial,
        serialUnique,
        platform,
        model,
        version,
        state: DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED,
        manufacturer,
        isVirtual: isVirtual ? 1 : 0,
        resolutionWidth,
        resolutionHeight,
        installedBrowserInfos: {
          installedBrowserInfos,
        },
      };
      return message;
    });
    messages.forEach((message) => this.notify(message));
  }

  @OnEvent(OnDevicesDisconnectedEvent.key)
  onDevicesDisconnected(value: Instance<typeof OnDevicesDisconnectedEvent.value>): void {
    const messages = value.serials.map((serial) => {
      const message: Instance<typeof DeviceConnectionSubscribe.receiveMessage> = {
        serial: serial,
        serialUnique: '',
        platform: Platform.PLATFORM_UNSPECIFIED,
        model: '',
        version: '',
        state: DeviceConnectionState.DEVICE_CONNECTION_STATE_DISCONNECTED,
        manufacturer: '',
        isVirtual: 0,
        resolutionWidth: 0,
        resolutionHeight: 0,
      };
      return message;
    });
    messages.forEach((message) => this.notify(message));
  }

  override async onWebSocketOpen(webSocket: WebSocket, incommingMessage: IncomingMessage): Promise<null> {
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
