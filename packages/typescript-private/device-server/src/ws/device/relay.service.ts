import { OnWebSocketClose, OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { Serial } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, Instance } from '@dogu-tech/common';
import { DeviceRelay, DoguDeviceRelayPortHeaderKey, DoguDeviceRelaySerialHeaderKey, TcpRelayResponse } from '@dogu-tech/device-client-common';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import WebSocket from 'ws';
import { getFreePort } from '../../internal/util/net';
import { DoguLogger } from '../../logger/logger';
import { ScanService } from '../../scan/scan.service';

interface Value {
  serial: Serial;
  port: number;
  hostPort: number;
  client: Socket;
}

@WebSocketService(DeviceRelay)
export class DeviceRelayService
  extends WebSocketGatewayBase<Value, typeof DeviceRelay.sendMessage, typeof DeviceRelay.receiveMessage>
  implements OnWebSocketMessage<Value, typeof DeviceRelay.sendMessage, typeof DeviceRelay.receiveMessage>, OnWebSocketClose<Value>
{
  constructor(private readonly scanService: ScanService, private readonly logger: DoguLogger) {
    super(DeviceRelay, logger);
  }

  override async onWebSocketOpen(webSocket: WebSocket, incommingMessage: IncomingMessage): Promise<Value> {
    const { headers } = incommingMessage;
    this.logger.info(`DeviceRelayService.onWebSocketOpen`, { headers });
    const serial = headers[DoguDeviceRelaySerialHeaderKey] as Serial;
    if (!serial) {
      throw new Error(`serial not found`);
    }
    if (typeof serial !== 'string') {
      throw new Error(`serial isn't string`);
    }
    const portHeader = headers[DoguDeviceRelayPortHeaderKey];
    if (!portHeader) {
      throw new Error(`port not found`);
    }
    const port = parseInt(portHeader as string);
    if (isNaN(port)) {
      throw new Error(`port isn't number`);
    }

    this.logger.info(`DeviceRelayService.onWebSocketOpen`, { serial, port });

    const deviceChannel = this.scanService.findChannel(serial);
    if (deviceChannel === null) {
      throw new Error(`Not found ${serial}`);
    }
    const hostPort = await getFreePort();
    try {
      await deviceChannel.forward(hostPort, port);
    } catch (e) {
      throw new Error(`Forward to ${port} failed`);
    }
    const client = new Socket();

    client.on('close', (isError: boolean) => {
      this.logger.verbose('DeviceRelayService. deviceside socket closed', { isError });
      closeWebSocketWithTruncateReason(webSocket, 1000, 'Close');
    });

    client.on('data', (data: Buffer) => {
      const base64 = data.toString('base64');
      const message: TcpRelayResponse = {
        encodedData: base64,
      };
      webSocket.send(JSON.stringify(message));
    });
    client.setNoDelay(true);
    client.setKeepAlive(true);

    const isConnected = await new Promise<boolean>((resolve, reject) => {
      client.once('close', (isError: boolean) => {
        resolve(false);
      });
      client.connect({ host: '127.0.0.1', port: hostPort }, () => {
        resolve(true);
      });
    });

    if (!isConnected) {
      throw new Error(`Connect to ${hostPort} failed`);
    }

    this.logger.info(`DeviceRelayService.onWebSocketOpen success`, { serial, port });
    return { serial, port, hostPort, client };
  }

  onWebSocketClose(webSocket: WebSocket, event: WebSocket.CloseEvent, valueAccessor: WebSocketRegistryValueAccessor<Value>): void {
    const { serial, port, client } = valueAccessor.get();
    this.logger.info(`DeviceRelayService.onWebSocketClose`, { serial, port });
    client.resetAndDestroy();
  }

  async onWebSocketMessage(webSocket: WebSocket, message: Instance<typeof DeviceRelay.sendMessage>, valueAccessor: WebSocketRegistryValueAccessor<Value>): Promise<void> {
    const { client } = valueAccessor.get();
    client.write(Buffer.from(message.encodedData, 'base64'));
  }
}
