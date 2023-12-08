import { CustomTransportStrategy, Server } from '@nestjs/microservices';

export const MessageTransportId = Symbol('Message');

export class MessageMicroService extends Server implements CustomTransportStrategy {
  transportId = MessageTransportId;

  listen(callback: () => void): void {
    this.logger.log('message handlers', this.messageHandlers);
    callback();
  }

  close(): void {
    // noop
  }
}
