import { DeviceRunnerId, OrganizationId, RoutineStepId } from '@dogu-private/types';
import { StackEnvironmentVariableReplacer } from '@dogu-tech/node';
import { MessageRouter } from '../message/message.router';
import { MessageCanceler, MessageContext, StepMessageEventHandler } from '../message/message.types';
import { MessageInfo, Resolve } from '../types';

export interface StepRegistryKeySource {
  executorOrganizationId: OrganizationId;
  routineStepId: RoutineStepId;
}
export type StepRegistryKey = string;
export interface StepRegistryInfo extends StepRegistryKeySource {
  messageCanceler: MessageCanceler | null;
}

export type ResolveStep = Resolve<void>;

export class StepMessageContext extends MessageContext {
  constructor(
    info: MessageInfo,
    router: MessageRouter,
    replacer: StackEnvironmentVariableReplacer,
    handler: StepMessageEventHandler,
    readonly workingPath: string,
    readonly deviceRunnerId: DeviceRunnerId,
  ) {
    super(info, router, replacer, handler);
  }
}
