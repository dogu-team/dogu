import { IsFilledString, WebSocketSpec } from '@dogu-tech/common';

export class WebSocketRelayRequest {
  @IsFilledString()
  encodedData!: string; // base64 encoded
}

export class WebSocketRelayResponse {
  @IsFilledString()
  encodedData!: string; // base64 encoded
}

export const DoguDeviceTcpRelayPortHeaderKey = 'dogu-device-relay-port';

export const DeviceHostWebSocketRelay = new WebSocketSpec({
  path: '/ws/device-host/relay/web-socket',
  sendMessage: WebSocketRelayRequest,
  receiveMessage: WebSocketRelayResponse,
});
