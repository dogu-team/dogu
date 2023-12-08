import { DeviceAuthSubscribe } from '@dogu-private/dost-children';
import { OnWebSocketClose, OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { closeWebSocketWithTruncateReason, delay, Instance } from '@dogu-tech/common';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { DeviceAuthService } from '../device-auth/device-auth.service';
import { DoguLogger } from '../logger/logger';

interface Value {
  validated: boolean;
}

@WebSocketService(DeviceAuthSubscribe)
export class DeviceAuthSubscribeService
  extends WebSocketGatewayBase<Value, typeof DeviceAuthSubscribe.sendMessage, typeof DeviceAuthSubscribe.receiveMessage>
  implements OnWebSocketClose<Value>, OnWebSocketMessage<Value, typeof DeviceAuthSubscribe.sendMessage, typeof DeviceAuthSubscribe.receiveMessage>
{
  constructor(
    private readonly authService: DeviceAuthService,
    private readonly logger: DoguLogger,
  ) {
    super(DeviceAuthSubscribe, logger);
  }

  override onWebSocketOpen(webSocket: WebSocket, incommingMessage: IncomingMessage): Value {
    return { validated: false };
  }

  onWebSocketClose(webSocket: WebSocket, event: WebSocket.CloseEvent, valueAccessor: WebSocketRegistryValueAccessor<Value>): void {}

  async onWebSocketMessage(webSocket: WebSocket, message: Instance<typeof DeviceAuthSubscribe.sendMessage>, valueAccessor: WebSocketRegistryValueAccessor<Value>): Promise<void> {
    const { authService } = this;
    const { value } = message;
    switch (value.kind) {
      case 'DeviceAuthSubscribeSendMessageValidateValue':
        {
          if (!authService.validate(value.currentToken.value)) {
            closeWebSocketWithTruncateReason(webSocket, 1001, 'invalid token');
            return;
          }

          valueAccessor.update({
            validated: true,
          });
        }
        break;
      case 'DeviceAuthSubscribeSendMessageOnRefreshedValue':
        {
          const { validated } = valueAccessor.get();
          if (!validated) {
            closeWebSocketWithTruncateReason(webSocket, 1001, 'invalid token');
            return;
          }
          if (!authService.validate(value.beforeToken.value)) {
            closeWebSocketWithTruncateReason(webSocket, 1001, 'invalid token');
            return;
          }
          authService.refreshAdminToken(value.newToken.value);
        }
        break;
    }

    await delay(0);
  }
}
