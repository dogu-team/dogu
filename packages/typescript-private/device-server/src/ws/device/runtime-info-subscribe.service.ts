import { OnWebSocketClose, OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { Instance, validateAndEmitEventAsync } from '@dogu-tech/common';
import { DeviceRuntimeInfoSubscribe } from '@dogu-tech/device-client-common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { OnDeviceRuntimeInfoSubscriberConnectedEvent, OnDeviceRuntimeInfoSubscriberDisconnectedEvent, OnDeviceRuntimeInfoUpdatedEvent } from '../../events';
import { DoguLogger } from '../../logger/logger';

interface Value {
  serial: string;
}

@WebSocketService(DeviceRuntimeInfoSubscribe)
export class DeviceRuntimeInfoSubscribeService
  extends WebSocketGatewayBase<Value, typeof DeviceRuntimeInfoSubscribe.sendMessage, typeof DeviceRuntimeInfoSubscribe.receiveMessage>
  implements OnWebSocketClose<Value>, OnWebSocketMessage<Value, typeof DeviceRuntimeInfoSubscribe.sendMessage, typeof DeviceRuntimeInfoSubscribe.receiveMessage>
{
  constructor(private readonly eventEmitter: EventEmitter2, private readonly logger: DoguLogger) {
    super(DeviceRuntimeInfoSubscribe, logger);
  }

  @OnEvent(OnDeviceRuntimeInfoUpdatedEvent.key)
  onDeviceRuntimeInfoUpdated(value: Instance<typeof OnDeviceRuntimeInfoUpdatedEvent.value>): void {
    const { deviceRuntimeInfos } = value;
    deviceRuntimeInfos.forEach((deviceRuntimeInfo) => {
      const { serial, runtimeInfo } = deviceRuntimeInfo;
      const receiveMessage: Instance<typeof DeviceRuntimeInfoSubscribe.receiveMessage> = {
        runtimeInfo,
      };
      this.webSockets.forEach((value, webSocket) => {
        if (value.serial === serial) {
          webSocket.send(JSON.stringify(receiveMessage));
        }
      });
    });
  }

  override async onWebSocketOpen(webSocket: WebSocket, incommingMessage: IncomingMessage): Promise<Value> {
    await validateAndEmitEventAsync(this.eventEmitter, OnDeviceRuntimeInfoSubscriberConnectedEvent, {
      webSocket,
    });
    return { serial: '' };
  }

  async onWebSocketClose(webSocket: WebSocket, event: WebSocket.CloseEvent, valueAccessor: WebSocketRegistryValueAccessor<Value>): Promise<void> {
    await validateAndEmitEventAsync(this.eventEmitter, OnDeviceRuntimeInfoSubscriberDisconnectedEvent, {
      webSocket,
    });
  }

  onWebSocketMessage(webSocket: WebSocket, message: Instance<typeof DeviceRuntimeInfoSubscribe.sendMessage>, valueAccessor: WebSocketRegistryValueAccessor<Value>): void {
    const { serial } = message;
    valueAccessor.update({ serial });
  }
}
