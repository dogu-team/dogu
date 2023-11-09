import { OnWebSocketClose, OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { DeviceAlert, Platform } from '@dogu-private/types';
import { delay, DuplicatedCallGuarder, Instance, stringify, SyncClosable } from '@dogu-tech/common';
import { DeviceAlertSubscribe, DeviceAlertSubscribeReceiveMessageValue } from '@dogu-tech/device-client-common';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { DoguLogger } from '../../logger/logger';
import { ScanService } from '../../scan/scan.service';

interface Value {
  closer: SyncClosable | null;
}

@WebSocketService(DeviceAlertSubscribe)
export class DeviceAlertSubscribeService
  extends WebSocketGatewayBase<Value, typeof DeviceAlertSubscribe.sendMessage, typeof DeviceAlertSubscribe.receiveMessage>
  implements OnWebSocketClose<Value>, OnWebSocketMessage<Value, typeof DeviceAlertSubscribe.sendMessage, typeof DeviceAlertSubscribe.receiveMessage>
{
  constructor(
    private readonly scanService: ScanService,
    private readonly logger: DoguLogger,
  ) {
    super(DeviceAlertSubscribe, logger);
  }

  override onWebSocketOpen(webSocket: WebSocket, incommingMessage: IncomingMessage): Value {
    return {
      closer: null,
    };
  }

  private clearClosable(valueAccessor: WebSocketRegistryValueAccessor<Value>): void {
    const value = valueAccessor.get();
    if (value.closer !== null) {
      const { closer } = value;
      closer.close();
      valueAccessor.update({
        closer: null,
      });
    }
  }

  onWebSocketClose(webSocket: WebSocket, event: WebSocket.CloseEvent, valueAccessor: WebSocketRegistryValueAccessor<Value>): void {
    this.clearClosable(valueAccessor);
  }

  async onWebSocketMessage(webSocket: WebSocket, message: Instance<typeof DeviceAlertSubscribe.sendMessage>, valueAccessor: WebSocketRegistryValueAccessor<Value>): Promise<void> {
    const { serial } = message;
    const deviceChannel = this.scanService.findChannel(serial);
    if (deviceChannel === null) {
      throw new Error(`Device with serial ${serial} not found`);
    }
    if (deviceChannel.platform !== Platform.PLATFORM_IOS) {
      throw new Error(`DeviceAlertSubscribeService only supports iOS platform`);
    }

    this.clearClosable(valueAccessor);

    function send(value: DeviceAlertSubscribeReceiveMessageValue): void {
      const receiveMessage: Instance<typeof DeviceAlertSubscribe.receiveMessage> = {
        value,
      };
      webSocket.send(JSON.stringify(receiveMessage));
    }

    let lastAlert: DeviceAlert | undefined;
    const guard = new DuplicatedCallGuarder();
    const interval = setInterval(() => {
      guard
        .guard(async (): Promise<void> => {
          if (lastAlert) {
            await delay(100); // poll close fast
          } else {
            await delay(500); // poll open slowly
          }
          const alert = await deviceChannel.getAlert();
          if (stringify(alert) === stringify(lastAlert)) {
            return;
          }
          if (!alert) {
            send({
              kind: 'DeviceAlertSubscribeReceiveMessageOnCloseValue',
              title: lastAlert?.title ?? 'unknown',
            });
          } else {
            send({
              kind: 'DeviceAlertSubscribeReceiveMessageOnShowValue',
              title: alert.title,
            });
          }
          lastAlert = alert;
        })
        .catch((error) => {
          this.logger.error(error);
        });
    }, 100);
    const closer: SyncClosable = {
      close(): void {
        clearInterval(interval);
      },
    };

    valueAccessor.update({
      closer,
    });
    await Promise.resolve();
  }
}
