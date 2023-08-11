import { IsFilledString, WebSocketSpec } from '@dogu-tech/common';

export class TcpRelayRequest {
  @IsFilledString()
  encodedData!: string; // base64 encoded
}

export class TcpRelayResponse {
  @IsFilledString()
  encodedData!: string; // base64 encoded
}

export const DoguDeviceTcpRelaySerialHeaderKey = 'dogu-device-tcp-relay-serial';
export const DoguDeviceTcpRelayPortHeaderKey = 'dogu-device-tcp-relay-port';

export const DeviceTcpRelay = new WebSocketSpec({
  path: '/ws/devices/relay/tcp',
  sendMessage: TcpRelayRequest,
  receiveMessage: TcpRelayResponse,
});