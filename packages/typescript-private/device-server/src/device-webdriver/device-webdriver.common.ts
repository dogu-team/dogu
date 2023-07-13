import { HeaderRecord } from '@dogu-tech/common';
import { RelayRequest, RelayResponse, SessionDeletedParam } from '@dogu-tech/device-client-common';

export interface DeviceWebDriverHandler {
  onRelayHttp(headers: HeaderRecord, request: RelayRequest): Promise<RelayResponse>;
  onSessionDeleted(headers: HeaderRecord, param: SessionDeletedParam): Promise<void>;
}
