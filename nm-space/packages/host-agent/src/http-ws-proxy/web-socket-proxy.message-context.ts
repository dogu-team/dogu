import { StackEnvironmentVariableReplacer } from '@dogu-tech/node';
import { MessageRouter } from '../message/message.router';
import { MessageContext, MessageEventHandler } from '../message/message.types';
import { MessageInfo } from '../types';

export class WebSocketProxyMessageContext extends MessageContext {
  constructor(info: MessageInfo, router: MessageRouter, replacer: StackEnvironmentVariableReplacer, handler: MessageEventHandler) {
    super(info, router, replacer, handler);
  }
}
