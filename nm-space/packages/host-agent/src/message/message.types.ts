import { isFunction, Log, PromiseOrValue } from '@dogu-tech/common';
import { StackEnvironmentVariableReplacer } from '@dogu-tech/node';
import { MessageInfo } from '../types';
import { MessageRouter } from './message.router';

export interface MessageCanceler {
  cancel: () => PromiseOrValue<void>;
}

export const NullMessageCanceler: MessageCanceler = {
  cancel(): void {
    // noop
  },
};

export interface MessagePostProcessor {
  postProcess: () => PromiseOrValue<void>;
}

export const NullMessagePostProcessor: MessagePostProcessor = {
  postProcess(): void {
    // noop
  },
};

export interface MessageEventHandler {
  onLog(log: Log): PromiseOrValue<void>;
  onCancelerCreated(canceler: MessageCanceler): PromiseOrValue<void>;
}

export interface StepMessageEventHandler extends MessageEventHandler {
  onProcessStarted(pid?: number): PromiseOrValue<void>;
}

export function isStepMessageEventHandler(param: MessageEventHandler): param is StepMessageEventHandler {
  return isFunction((param as unknown as StepMessageEventHandler).onProcessStarted);
}

export const NullMessageEventHandler: MessageEventHandler = {
  onLog(): void {
    // noop
  },
  onCancelerCreated(): void {
    // noop
  },
};

export class MessageContext {
  constructor(
    readonly info: MessageInfo,
    readonly router: MessageRouter,
    readonly environmentVariableReplacer: StackEnvironmentVariableReplacer,
    readonly eventHandler: MessageEventHandler,
  ) {}
}
