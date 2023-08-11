import { IsFilledString, WebSocketSpec } from '@dogu-tech/common';

export class WebSocketRelaySendMessage {
  @IsFilledString()
  data!: string;
}

export class WebSocketRelayReceiveMessage {
  @IsFilledString()
  data!: string;
}

export const DoguDeviceWebSocketRelaySerialHeader = 'dogu-device-websocket-relay-serial';
export const DoguDeviceWebSocketRelayUrlHeader = 'dogu-device-websocket-relay-url';

export const DeviceWebSocketRelay = new WebSocketSpec({
  path: '/ws/devices/relay/websocket',
  sendMessage: WebSocketRelaySendMessage,
  receiveMessage: WebSocketRelayReceiveMessage,
});
