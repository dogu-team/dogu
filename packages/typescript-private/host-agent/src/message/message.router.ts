import { KindHavable, transformAndValidate } from '@dogu-tech/common';
import { MessageHandler } from '@nestjs/microservices';
import { ClassConstructor } from 'class-transformer';
import { lastValueFrom, Observable } from 'rxjs';
import { MessageHandlerInfo, MessageHandlers } from '../types';
import { MessageContext } from './message.types';

export class MessageRouter {
  constructor(protected readonly messageHandlers: MessageHandlers) {}

  async route<P extends KindHavable, R extends KindHavable | void>(param: P, context: MessageContext): Promise<R> {
    const { kind } = param;
    const handler = this.messageHandlers.get(kind);
    if (handler === undefined) {
      throw new Error(`message handler not found: ${kind}`);
    }
    const casted = handler as unknown as MessageHandler<P, MessageContext, R>;
    if (casted.extras === undefined) {
      throw new Error(`message handler extras not found: ${kind}`);
    }
    const maybeObservable = await casted(param, context);
    const result = maybeObservable instanceof Observable<R> ? await lastValueFrom(maybeObservable) : maybeObservable;
    const handlerInfo = casted.extras as MessageHandlerInfo<ClassConstructor<P>, ClassConstructor<R>>;
    if (handlerInfo.result === null) {
      return result;
    }
    const validated = await transformAndValidate(handlerInfo.result, result);
    return validated;
  }
}
