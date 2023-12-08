import { RelayRequest, RelayResponse } from '@dogu-tech/device-client-common';

export interface EndpointHandlerResultError {
  status: number;
  error: Error;
  data: object;
}

export interface OnBeforeRequestResultOk {
  error?: undefined;
  request: RelayRequest;
}

export type OnBeforeRequestResult = EndpointHandlerResultError | OnBeforeRequestResultOk;

export interface OnAfterRequestResultOk {
  error?: undefined;
  response: RelayResponse;
}

export type OnAfterRequestResult = EndpointHandlerResultError | OnAfterRequestResultOk;
