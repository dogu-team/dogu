import { OnWebSocketClose, OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { Serial } from '@dogu-private/types';
import { errorify, Instance, LogLevel, stringify } from '@dogu-tech/common';
import { DeviceForward } from '@dogu-tech/device-client-common';
import { DateNano } from '@dogu-tech/node';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { AuthIncomingMessage, DeviceWsPermission } from '../../auth/guard/device.ws.guard';
import { DoguLogger } from '../../logger/logger';
import { ScanService } from '../../scan/scan.service';

interface Value {
  serial: Serial;
  hostPort: number;
}

@WebSocketService(DeviceForward)
export class DeviceForwardService
  extends WebSocketGatewayBase<Value, typeof DeviceForward.sendMessage, typeof DeviceForward.receiveMessage>
  implements OnWebSocketMessage<Value, typeof DeviceForward.sendMessage, typeof DeviceForward.receiveMessage>, OnWebSocketClose<Value>
{
  constructor(
    private readonly scanService: ScanService,
    private readonly logger: DoguLogger,
  ) {
    super(DeviceForward, logger);
  }

  @DeviceWsPermission({ allowAdmin: true, allowTemporary: 'serial' })
  override onWebSocketOpen(webSocket: WebSocket, @AuthIncomingMessage() incommingMessage: IncomingMessage): Value {
    return { serial: '', hostPort: 0 };
  }

  async onWebSocketMessage(webSocket: WebSocket, message: Instance<typeof DeviceForward.sendMessage>, valueAccessor: WebSocketRegistryValueAccessor<Value>): Promise<void> {
    const { serial } = message;
    const deviceChannel = this.scanService.findChannel(serial);
    if (deviceChannel === null) {
      throw new Error(`Device with serial ${serial} not found`);
    }

    const { hostPort, devicePort } = message;
    await Promise.resolve(
      deviceChannel.forward(hostPort, devicePort, {
        error: (message, details) => {
          this.send(webSocket, this.createLogMessage('error', stringify(message), details));
        },
        info: (message, details) => {
          this.send(webSocket, this.createLogMessage('info', stringify(message), details));
        },
      }),
    )
      .then(() => {
        this.send(webSocket, {
          value: {
            kind: 'DeviceForwardReceiveMessageResultValue',
            success: true,
          },
        });
      })
      .catch((reason) => {
        this.send(webSocket, {
          value: {
            kind: 'DeviceForwardReceiveMessageResultValue',
            success: false,
            reason: errorify(reason),
          },
        });
      });
    valueAccessor.update({ serial, hostPort });
  }

  private createLogMessage(level: LogLevel, message: string, details?: Record<string, unknown>): Instance<typeof DeviceForward.receiveMessage> {
    const result: Instance<typeof DeviceForward.receiveMessage> = {
      value: {
        kind: 'DeviceForwardReceiveMessageLogValue',
        log: {
          level,
          message,
          details,
          localTimeStampNano: new DateNano().toRFC3339Nano(),
        },
      },
    };
    return result;
  }

  async onWebSocketClose(webSocket: WebSocket, event: WebSocket.CloseEvent, valueAccessor: WebSocketRegistryValueAccessor<Value>): Promise<void> {
    const { serial, hostPort } = valueAccessor.get();
    if (serial.length !== 0 && hostPort !== 0) {
      const deviceChannel = this.scanService.findChannel(serial);
      if (deviceChannel !== null) {
        await deviceChannel.unforward(hostPort);
      }
    }
  }
}
