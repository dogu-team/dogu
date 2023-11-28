import { DeviceAuthSubscribe } from '@dogu-private/dost-children';
import { DeviceAdminToken } from '@dogu-private/types';
import { FilledPrintable, Instance, setAxiosErrorFilterToIntercepter, stringify } from '@dogu-tech/common';
import { DeviceAuth } from '@dogu-tech/device-client-common';
import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';

export class DeviceAuthService {
  private _adminToken: DeviceAdminToken;
  private _deviceServerClient: AxiosInstance | undefined;

  get adminToken(): DeviceAdminToken {
    return this._adminToken;
  }

  constructor(private logger: FilledPrintable) {
    this._adminToken = new DeviceAdminToken(uuidv4());
  }

  onDeviceServerStart(host: string, port: number): void {
    this._deviceServerClient = axios.create({
      baseURL: `http://${host}:${port}`,
    });
    setAxiosErrorFilterToIntercepter(this._deviceServerClient);
  }

  subscribeHostAgent(host: string, port: number): void {
    this.subscribeInternal(host, port);
  }

  private subscribeInternal(host: string, port: number): void {
    const { logger } = this;
    const webSocket = new WebSocket(`ws://${host}:${port}${DeviceAuthSubscribe.path}`, {
      handshakeTimeout: 3000,
    });

    webSocket.on('open', () => {
      const sendMessage: Instance<typeof DeviceAuthSubscribe.sendMessage> = {
        value: {
          kind: 'DeviceAuthSubscribeSendMessageValidateValue',
          currentToken: this._adminToken,
        },
      };
      webSocket.send(JSON.stringify(sendMessage));
    });

    webSocket.addEventListener('message', (event: WebSocket.MessageEvent) => {
      const { data } = event;
      const receiveMessage = JSON.parse(stringify(data)) as Instance<typeof DeviceAuthSubscribe.receiveMessage>;
      const { value } = receiveMessage;
      switch (value.kind) {
        case 'DeviceAuthSubscribeReceiveMessageTryRefreshedValue': {
          this.notifyRefreshToken(webSocket).catch((err) => {
            logger.error('notifyRefreshToken', { error: err });
          });
          break;
        }
      }
    });

    webSocket.on('error', (error: Error) => {});

    webSocket.on('close', () => {
      setTimeout(() => {
        this.subscribeInternal(host, port);
      }, 3000);
    });
  }

  private async notifyRefreshToken(webSocket: WebSocket): Promise<void> {
    const { logger } = this;
    const beforeToken = this._adminToken;

    if (!this._deviceServerClient) {
      logger.error('Device server client is not initialized');
      return;
    }
    const newToken = new DeviceAdminToken(uuidv4());
    const request: Instance<typeof DeviceAuth.refreshAdminToken.requestBody> = {
      newToken,
    };
    await this._deviceServerClient.post(`${DeviceAuth.controller.path}${DeviceAuth.refreshAdminToken.path}`, request, {
      headers: { Authorization: `Custom ${beforeToken.value}` },
    });

    const sendMessage: Instance<typeof DeviceAuthSubscribe.sendMessage> = {
      value: {
        kind: 'DeviceAuthSubscribeSendMessageOnRefreshedValue',
        beforeToken,
        newToken,
      },
    };
    webSocket.send(JSON.stringify(sendMessage));
    this._adminToken = newToken;
  }
}
