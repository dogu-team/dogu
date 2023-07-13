import { RelayRequest, RelayResponse, SessionDeletedParam } from '@dogu-tech/device-client-common';

export interface DeviceWebDriverHandler {
  onRelayHttp(request: RelayRequest): Promise<RelayResponse>;
  onSessionDeleted(param: SessionDeletedParam): Promise<void>;
}

export interface DeviceWebDriverEndpointHandlerResultError {
  status: number;
  error: Error;
  data: object;
}

export interface DeviceWebDriverEndpointHandlerResultOk {
  error?: undefined;
  request: RelayRequest;
}

export type DeviceWebDriverEndpointHandlerResult = DeviceWebDriverEndpointHandlerResultError | DeviceWebDriverEndpointHandlerResultOk;
