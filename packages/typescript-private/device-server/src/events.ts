import { Serial } from '@dogu-private/types';
import { createEventDefinition } from '@dogu-tech/common';
import { DeviceConfigDto } from '@dogu-tech/device-client-common';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmptyObject, ValidateNested } from 'class-validator';
import WebSocket from 'ws';
import { DeviceChannel } from './internal/public/device-channel';
import { DeviceRuntimeInfo } from './types';

export class OnUpdateEventValue {}
export const OnUpdateEvent = createEventDefinition('OnUpdate', OnUpdateEventValue);

export class OnDevicesConnectedEventValue {
  @IsArray()
  channels!: Readonly<DeviceChannel>[];
}
export const OnDevicesConnectedEvent = createEventDefinition('OnDevicesConnected', OnDevicesConnectedEventValue);

export class OnDevicesDisconnectedEventValue {
  @IsArray()
  serials!: Serial[];
}
export const OnDevicesDisconnectedEvent = createEventDefinition('OnDevicesDisconnected', OnDevicesDisconnectedEventValue);

export class OnDeviceConfigChangedEventValue {
  @IsNotEmptyObject()
  channel!: Readonly<DeviceChannel>;

  @IsNotEmptyObject()
  config!: DeviceConfigDto;
}
export const OnDeviceConfigChangedEvent = createEventDefinition('OnDeviceConfigChanged', OnDeviceConfigChangedEventValue);

export class OnDeviceRuntimeInfoUpdatedEventValue {
  @ValidateNested({ each: true })
  @Type(() => DeviceRuntimeInfo)
  @IsArray()
  deviceRuntimeInfos!: DeviceRuntimeInfo[];
}
export const OnDeviceRuntimeInfoUpdatedEvent = createEventDefinition('OnDeviceRuntimeInfoUpdated', OnDeviceRuntimeInfoUpdatedEventValue);

export class OnWebSocketEventValueBase {
  @IsNotEmptyObject()
  webSocket!: WebSocket;
}

export class OnDeviceConnectionSubscriberConnectedEventValue extends OnWebSocketEventValueBase {}
export const OnDeviceConnectionSubscriberConnectedEvent = createEventDefinition('OnDeviceConnectionSubscriberConnected', OnDeviceConnectionSubscriberConnectedEventValue);

export class OnDeviceConnectionSubscriberDisconnectedEventValue extends OnWebSocketEventValueBase {}
export const OnDeviceConnectionSubscriberDisconnectedEvent = createEventDefinition('OnDeviceConnectionSubscriberDisconnected', OnDeviceConnectionSubscriberDisconnectedEventValue);

export class OnDeviceLogSubscriberConnectedEventValue extends OnWebSocketEventValueBase {}
export const OnDeviceLogSubscriberConnectedEvent = createEventDefinition('OnDeviceLogSubscriberConnected', OnDeviceLogSubscriberConnectedEventValue);

export class OnDeviceLogSubscriberDisconnectedEventValue extends OnWebSocketEventValueBase {}
export const OnDeviceLogSubscriberDisconnectedEvent = createEventDefinition('OnDeviceLogSubscriberDisconnected', OnDeviceLogSubscriberDisconnectedEventValue);

export class OnDeviceRuntimeInfoSubscriberConnectedEventValue extends OnWebSocketEventValueBase {}
export const OnDeviceRuntimeInfoSubscriberConnectedEvent = createEventDefinition('OnDeviceRuntimeInfoSubscriberConnected', OnDeviceRuntimeInfoSubscriberConnectedEventValue);

export class OnDeviceRuntimeInfoSubscriberDisconnectedEventValue extends OnWebSocketEventValueBase {}
export const OnDeviceRuntimeInfoSubscriberDisconnectedEvent = createEventDefinition(
  'OnDeviceRuntimeInfoSubscriberDisconnected',
  OnDeviceRuntimeInfoSubscriberDisconnectedEventValue,
);
