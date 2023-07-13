import { RelayRequest } from '@dogu-tech/device-client-common';

export interface EndpointHandlerResultError {
  status: number;
  error: Error;
  data: object;
}

export interface EndpointHandlerResultOk {
  error?: undefined;
  request: RelayRequest;
}

export type EndpointHandlerResult = EndpointHandlerResultError | EndpointHandlerResultOk;
