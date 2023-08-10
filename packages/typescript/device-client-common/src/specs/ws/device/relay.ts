import { IsFilledString, WebSocketSpec } from '@dogu-tech/common';
import { IsNumber } from 'class-validator';

export class TcpRelayRequest {
  @IsNumber()
  seq!: number;

  @IsFilledString()
  encodedData!: string; // base64 encoded
}

export class TcpRelayResponse {
  @IsNumber()
  seq!: number;

  @IsFilledString()
  encodedData!: string; // base64 encoded
}

export const DoguDeviceRelaySerialHeaderKey = 'dogu-device-relay-serial';
export const DoguDeviceRelayPortHeaderKey = 'dogu-device-relay-port';

export const DeviceRelay = new WebSocketSpec({
  path: '/ws/devices/relay/tcp',
  sendMessage: TcpRelayRequest,
  receiveMessage: TcpRelayResponse,
});
