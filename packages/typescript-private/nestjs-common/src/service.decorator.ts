import { Path, WebSocketSpec } from '@dogu-tech/common';
import { WebSocketGateway } from '@nestjs/websockets';

export function WebSocketService<SendMessage, ReceiveMessage>(webSocketSpec: WebSocketSpec<SendMessage, ReceiveMessage>): ClassDecorator {
  return WebSocketGateway({ path: webSocketSpec.path, transports: ['websocket'] });
}

export function WebSocketRawService(soec: { path: Path }): ClassDecorator {
  return WebSocketGateway({ path: soec.path, transports: ['websocket'] });
}
