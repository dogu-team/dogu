import { DeviceAuthSubscribe } from '@dogu-private/dost-children';
import { DeviceAdminToken } from '@dogu-private/types';
import { Instance, stringify } from '@dogu-tech/common';
import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';

export class DeviceAuthService {
  private _adminToken: DeviceAdminToken;

  get adminToken(): DeviceAdminToken {
    return this._adminToken;
  }

  constructor() {
    this._adminToken = new DeviceAdminToken(uuidv4());
  }

  refreshAdminToken(): void {
    this._adminToken = new DeviceAdminToken(uuidv4());
  }

  subscribe(host: string, port: number): void {
    this.subscribeInternal(host, port);
  }

  private subscribeInternal(host: string, port: number): void {
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
          const beforeToken = this._adminToken;
          this.refreshAdminToken();
          const sendMessage: Instance<typeof DeviceAuthSubscribe.sendMessage> = {
            value: {
              kind: 'DeviceAuthSubscribeSendMessageOnRefreshedValue',
              beforeToken,
              newToken: this._adminToken,
            },
          };
          webSocket.send(JSON.stringify(sendMessage));
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
}
