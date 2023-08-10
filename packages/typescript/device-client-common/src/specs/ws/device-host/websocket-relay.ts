import { IsFilledString, WebSocketSpec } from '@dogu-tech/common';

export class WebSocketRelayRequest {
  @IsFilledString()
  data!: string;
}

export class WebSocketRelayResponse {
  @IsFilledString()
  data!: string;
}

export const DoguDeviceHostWebSocketRelayUrlHeader = 'dogu-device-host-web-socket-relay-url';

export const DeviceHostWebSocketRelay = new WebSocketSpec({
  path: '/ws/device-host/relay/web-socket',
  sendMessage: WebSocketRelayRequest,
  receiveMessage: WebSocketRelayResponse,
});
