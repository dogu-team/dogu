import { PrivateHostToken } from '@dogu-private/console-host-agent';
import { Device, Platform, ThirdPartyPathMap } from '@dogu-private/types';
import { Class, Instance, KindHavable } from '@dogu-tech/common';
import { MessageHandler, MessagePattern } from '@nestjs/microservices';
import { MessageTransportId } from './message/message.microservice';
import { MessageContext } from './message/message.types';

export interface HostConnectionStatus {
  status: 'connected' | 'disconnected';
  updatedAt: Date;
}

export type HostConnectionInfo = Instance<typeof PrivateHostToken.findHostByToken.responseBody>;
export interface HostResolutionInfo extends HostConnectionInfo {
  hostWorkspacePath: string;
  recordWorkspacePath: string;
  pathMap: ThirdPartyPathMap;
}

export type DeviceConnectionInfo = Pick<Device, 'serial' | 'serialUnique' | 'platform' | 'model' | 'version' | 'organizationId' | 'hostId' | 'isVirtual'>;
export interface DeviceResolutionInfo extends DeviceConnectionInfo, Pick<Device, 'deviceId'> {
  hostPlatform: Platform;
  rootWorkspacePath: string;
  recordWorkspacePath: string;
  hostWorkspacePath: string;
  deviceWorkspacePath: string;
  pathMap: ThirdPartyPathMap;
}

export type MessageInfo = DeviceResolutionInfo;
export type MessageHandlers = ReadonlyMap<string, MessageHandler<KindHavable, MessageContext, KindHavable>>;

export interface MessageHandlerInfo<P extends Class<P> = any, R extends Class<R> = any> {
  param: P;
  result: R | null;
}

export function OnConsoleMessage<P extends Class<P>, R extends Class<R>>(param: P, result: R | null = null): MethodDecorator {
  const messageHandlerInfo: MessageHandlerInfo<P, R> = { param, result };
  return MessagePattern(param.name, MessageTransportId, messageHandlerInfo);
}

export type ResolveValue<T> = T | PromiseLike<T>;
export type Resolve<T> = (value: ResolveValue<T>) => void;
