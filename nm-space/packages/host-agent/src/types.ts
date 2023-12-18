import { PrivateHostToken } from '@dogu-private/console-host-agent';
import { Device, Platform, ThirdPartyPathMap } from '@dogu-private/types';
import { Class, FilledPrintable, Instance, KindHavable, Registry } from '@dogu-tech/common';
import { BrowserInstallation } from '@dogu-tech/device-client';
import { MessageHandler, MessagePattern } from '@nestjs/microservices';
import WebSocket from 'ws';
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

export type DeviceConnectionInfo = Pick<
  Device,
  'serial' | 'serialUnique' | 'platform' | 'model' | 'version' | 'organizationId' | 'hostId' | 'isVirtual' | 'memory' | 'manufacturer' | 'resolutionWidth' | 'resolutionHeight'
> & {
  browserInstallations: BrowserInstallation[];
};
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export interface DeviceWebSocketHandler {
  onUnregister(webSocket: WebSocket): void;
}

export class DeviceWebSocketMap {
  private readonly map: Registry<string, { webSocket: WebSocket; handler: DeviceWebSocketHandler }>;

  constructor(
    private readonly logger: FilledPrintable,
    private readonly name: string,
  ) {
    this.map = new Registry(name);
  }

  register(key: string, webSocket: WebSocket, handler: DeviceWebSocketHandler): void {
    this.map.register(key, { webSocket, handler });
    this.logger.info('DeviceWebSocketMap.register', { name: this.name, key });
  }

  unregister(key: string): void {
    const value = this.map.unregister(key);
    if (!value) {
      return;
    }

    const { webSocket, handler } = value;
    handler.onUnregister(webSocket);
    this.logger.info('DeviceWebSocketMap.unregister', { name: this.name, key });
  }

  unregisterAll(): void {
    for (const key of this.map.keys()) {
      this.unregister(key);
    }
  }
}
