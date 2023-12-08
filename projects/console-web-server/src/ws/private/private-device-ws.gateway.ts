import { PrivateDeviceWs, PrivateDeviceWsConnectionDto } from '@dogu-private/console-host-agent';
import { closeWebSocketWithTruncateReason, errorify, Instance, loop, stringify, transformAndValidate } from '@dogu-tech/common';
import { OnGatewayConnection, WebSocketGateway, WsException } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { config } from '../../config';
import { HOST_ACTION_TYPE } from '../../module/auth/auth.types';
import { DeviceMessageQueue } from '../../module/device-message/device-message.queue';
import { DoguLogger } from '../../module/logger/logger';
import { WsCommonService } from '../common/ws-common.service';
import { DoguWsException } from '../common/ws-exception';

@WebSocketGateway({ path: PrivateDeviceWs.pullDeviceParamDatas.path })
export class PrivateDeviceWsGateway implements OnGatewayConnection {
  constructor(
    private readonly wsCommonService: WsCommonService,
    private readonly deviceMessageQueue: DeviceMessageQueue,
    private readonly logger: DoguLogger,
  ) {}

  async handleConnection(webSocket: WebSocket, incomingMessage: IncomingMessage): Promise<void> {
    this.logger.verbose('PrivateDeviceWsGateway.handleConnection', { remoteAddress: incomingMessage.socket.remoteAddress });

    this.wsCommonService.sendPing(webSocket, 'PrivateDeviceWsGateway');

    try {
      this.setHandlers(webSocket);
      return await this.handleConnectionInternal(webSocket, incomingMessage);
    } catch (e) {
      this.logger.error(`PrivateDeviceWsGateway.handleConnection error. ${stringify(e)}`);
      if (e instanceof DoguWsException) {
        closeWebSocketWithTruncateReason(webSocket, e.status, e.message);
      }
      closeWebSocketWithTruncateReason(webSocket, 1003, errorify(e).message);
    }
  }

  private setHandlers(webSocket: WebSocket): void {
    webSocket.on('error', (event) => {
      this.logger.verbose('PrivateDeviceWsGateway.error');
    });
    webSocket.on('close', (event) => {
      this.logger.verbose('PrivateDeviceWsGateway.close');
    });
    webSocket.on('message', (event: MessageEvent<ArrayBuffer>) => {
      this.logger.verbose('PrivateDeviceWsGateway.message');
    });
  }

  private async handleConnectionInternal(webSocket: WebSocket, incomingMessage: IncomingMessage): Promise<void> {
    const url = new URL(`http:${incomingMessage.url ?? ''}`);
    const organizationId = url.searchParams.get('organizationId');
    const hostId = url.searchParams.get('hostId');
    const deviceId = url.searchParams.get('deviceId');

    const connectionDto = await transformAndValidate(PrivateDeviceWsConnectionDto, {
      organizationId,
      hostId,
      deviceId,
    });

    const hostPayload = await this.wsCommonService.validateHostWithWebsocket(
      connectionDto.organizationId,
      '',
      connectionDto.hostId,
      connectionDto.deviceId,
      incomingMessage,
      HOST_ACTION_TYPE.DEVICE_API,
    );
    if (!hostPayload) {
      throw new WsException('Unauthorized');
    }

    for await (const _ of loop(config.virtualWebSocket.pop.intervalMilliseconds)) {
      if (webSocket.readyState !== WebSocket.OPEN) {
        break;
      }
      const datas = await this.deviceMessageQueue.popParamDatas(connectionDto.organizationId, connectionDto.deviceId, config.virtualWebSocket.pop.count);
      if (0 === datas.length) {
        continue;
      }
      const response: Instance<typeof PrivateDeviceWs.pullDeviceParamDatas.receiveMessage> = {
        datas,
      };
      webSocket.send(JSON.stringify(response));
    }
  }
}
