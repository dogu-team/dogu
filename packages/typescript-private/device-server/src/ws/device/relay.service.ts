import { OnWebSocketClose, OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { categoryFromPlatform, platformTypeFromPlatform, Serial } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, errorify, Instance, loop } from '@dogu-tech/common';
import { DeviceRelay, DoguDeviceRelayPortHeaderKey, DoguDeviceRelaySerialHeaderKey, TcpRelayResponse } from '@dogu-tech/device-client-common';
import { IncomingHttpHeaders, IncomingMessage } from 'http';
import { Socket } from 'net';
import WebSocket from 'ws';
import { DeviceChannel } from '../../internal/public/device-channel';
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
    const { serial, port } = this.parseHeader(headers);

    this.logger.info(`DeviceRelayService.onWebSocketOpen`, { serial, port });

    const deviceChannel = this.scanService.findChannel(serial);
    if (deviceChannel === null) {
      throw new Error(`Not found ${serial}`);
    }

    await this.waitDevicePortListening(deviceChannel, port);
    const hostPort = await this.forwardDevicePort(deviceChannel, port);

    const client = new Socket();
    client.setNoDelay(true);
    client.setKeepAlive(true);

    client.on('data', (data: Buffer) => {
      const base64 = data.toString('base64');
      const message: TcpRelayResponse = {
        encodedData: base64,
      };
      webSocket.send(JSON.stringify(message));
    });

    const isConnected = await new Promise<boolean>((resolve, reject) => {
      client.once('close', (isError: boolean) => {
        resolve(false);
      });
      client.connect({ host: '127.0.0.1', port: hostPort }, () => {
        resolve(true);
      });
    });

    if (!isConnected) {
      throw new Error(`connect to device:${port} failed`);
    }

    client.on('close', (isError: boolean) => {
      this.logger.verbose('DeviceRelayService. deviceside socket closed', { isError });
      closeWebSocketWithTruncateReason(webSocket, 1000, `tcp connection to ${port} closed`);
    });

    this.logger.info(`DeviceRelayService.onWebSocketOpen success`, { serial, port });
    return { serial, port, hostPort, client };
  }

  private parseHeader(headers: IncomingHttpHeaders): { serial: Serial; port: number } {
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
    return { serial, port };
  }

  onWebSocketClose(webSocket: WebSocket, event: WebSocket.CloseEvent, valueAccessor: WebSocketRegistryValueAccessor<Value>): void {
    const { serial, port, hostPort, client } = valueAccessor.get();
    this.logger.info(`DeviceRelayService.onWebSocketClose`, { serial, port });
    client.resetAndDestroy();
    const deviceChannel = this.scanService.findChannel(serial);
    if (deviceChannel) {
      Promise.resolve(deviceChannel.unforward(hostPort)).catch((error) => {
        this.logger.error(`DeviceRelayService.onWebSocketClose. unforward error`, { error: errorify(error) });
      });
    }
  }

  async onWebSocketMessage(webSocket: WebSocket, message: Instance<typeof DeviceRelay.sendMessage>, valueAccessor: WebSocketRegistryValueAccessor<Value>): Promise<void> {
    for await (const _ of loop(1000, 10)) {
      try {
        valueAccessor.get();
        break;
      } catch (e) {
        this.logger.error(`DeviceRelayService.onWebSocketMessage`, { error: errorify(e) });
      }
    }
    try {
      const { client } = valueAccessor.get();
      client.write(Buffer.from(message.encodedData, 'base64'));
    } catch (e) {
      this.logger.error(`DeviceRelayService.onWebSocketMessage. get error`, { error: errorify(e) });
      closeWebSocketWithTruncateReason(webSocket, 1001, 'send failed by open error');
    }
  }

  private async waitDevicePortListening(deviceChannel: DeviceChannel, port: number): Promise<void> {
    for await (const _ of loop(1000, 10)) {
      if (await deviceChannel.isPortListening(port)) {
        break;
      }
    }
    if (!(await deviceChannel.isPortListening(port))) {
      throw new Error(`port:${port} is not listening`);
    }
  }

  private async forwardDevicePort(deviceChannel: Readonly<DeviceChannel>, port: number): Promise<number> {
    const platformCategory = categoryFromPlatform(platformTypeFromPlatform(deviceChannel.platform));
    let hostPort = port;
    if (platformCategory === 'mobile') {
      hostPort = await getFreePort();
      try {
        await deviceChannel.forward(hostPort, port);
      } catch (e) {
        throw new Error(`Forward to ${port} failed`);
      }
    }
    return hostPort;
  }
}