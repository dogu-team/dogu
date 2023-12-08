import { RelayRequest, RelayResponse } from '@dogu-tech/device-client-common';
import { DoguLogger } from '../logger/logger';

export type HttpRequestRelayHandler = (url: string, request: RelayRequest, logger: DoguLogger) => Promise<RelayResponse>;

export abstract class HttpRequestRelayService {
  abstract getHandler(method: string): HttpRequestRelayHandler | null;
}
