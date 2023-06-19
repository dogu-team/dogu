import { WebSocketProxyId } from '@dogu-private/console-host-agent';
import { DeviceId, OrganizationId } from '@dogu-private/types';
import { createEventDefinition } from '@dogu-tech/common';
import { IsNumber, IsObject, IsString, IsUUID } from 'class-validator';

export class OnWebSocketProxyEventValueBase {
  @IsUUID()
  organizationId!: OrganizationId;

  @IsUUID()
  deviceId!: DeviceId;

  @IsUUID()
  webSocketProxyId!: WebSocketProxyId;
}

export class OnWebSocketProxyOpenEventValue extends OnWebSocketProxyEventValueBase {}
export const OnWebSocketProxyOpenEvent = createEventDefinition('OnWebSocketProxyOpen', OnWebSocketProxyOpenEventValue);

export class OnWebSocketProxyCloseEventValue extends OnWebSocketProxyEventValueBase {
  @IsNumber()
  code!: number;

  @IsString()
  reason!: string;
}
export const OnWebSocketProxyCloseEvent = createEventDefinition('OnWebSocketProxyClose', OnWebSocketProxyCloseEventValue);

export class OnWebSocketProxyErrorEventValue extends OnWebSocketProxyEventValueBase {
  @IsObject()
  error!: unknown;

  @IsString()
  message!: string;
}
export const OnWebSocketProxyErrorEvent = createEventDefinition('OnWebSocketProxyError', OnWebSocketProxyErrorEventValue);

export class OnWebSocketProxyMessageEventValue extends OnWebSocketProxyEventValueBase {
  @IsString()
  data!: string;
}
export const OnWebSocketProxyMessageEvent = createEventDefinition('OnWebSocketProxyMessage', OnWebSocketProxyMessageEventValue);
