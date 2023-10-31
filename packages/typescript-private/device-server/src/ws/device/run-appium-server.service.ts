import { OnWebSocketClose, OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { Serial } from '@dogu-private/types';
import { errorify, Instance, LogLevel } from '@dogu-tech/common';
import { DeviceRunAppiumServer } from '@dogu-tech/device-client-common';
import { DateNano } from '@dogu-tech/node';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { AppiumContext } from '../../appium/appium.context';
import { DoguLogger } from '../../logger/logger';
import { ScanService } from '../../scan/scan.service';

interface Value {
  serial: Serial;
}

@WebSocketService(DeviceRunAppiumServer)
export class DeviceRunAppiumServerService
  extends WebSocketGatewayBase<Value, typeof DeviceRunAppiumServer.sendMessage, typeof DeviceRunAppiumServer.receiveMessage>
  implements OnWebSocketMessage<Value, typeof DeviceRunAppiumServer.sendMessage, typeof DeviceRunAppiumServer.receiveMessage>, OnWebSocketClose<Value>
{
  constructor(
    private readonly scanService: ScanService,
    private readonly logger: DoguLogger,
  ) {
    super(DeviceRunAppiumServer, logger);
  }

  override onWebSocketOpen(webSocket: WebSocket, incommingMessage: IncomingMessage): Value {
    return { serial: '' };
  }

  async onWebSocketMessage(webSocket: WebSocket, message: Instance<typeof DeviceRunAppiumServer.sendMessage>, valueAccessor: WebSocketRegistryValueAccessor<Value>): Promise<void> {
    const { serial } = message;
    const deviceChannel = this.scanService.findChannel(serial);
    if (deviceChannel === null) {
      throw new Error(`Device with serial ${serial} not found`);
    }

    await Promise.resolve(deviceChannel.switchAppiumContext('remote', 'device-run-appium-server-start'))
      .then((context: AppiumContext) => {
        this.send(webSocket, {
          value: {
            kind: 'DeviceRunAppiumServerReceiveMessageResultValue',
            success: true,
            serverPort: context.getInfo().server.port,
          },
        });
      })
      .catch((reason) => {
        this.send(webSocket, {
          value: {
            kind: 'DeviceRunAppiumServerReceiveMessageResultValue',
            success: false,
            serverPort: 0,
            reason: errorify(reason),
          },
        });
      });
    valueAccessor.update({ serial });
  }

  private createLogMessage(level: LogLevel, message: string, details?: Record<string, unknown>): Instance<typeof DeviceRunAppiumServer.receiveMessage> {
    const result: Instance<typeof DeviceRunAppiumServer.receiveMessage> = {
      value: {
        kind: 'DeviceRunAppiumServerReceiveMessageLogValue',
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
    const { serial } = valueAccessor.get();
    if (serial.length !== 0) {
      const deviceChannel = this.scanService.findChannel(serial);
      if (deviceChannel !== null) {
        await deviceChannel.switchAppiumContext('builtin', 'device-run-appium-server-end');
      }
    }
  }
}
