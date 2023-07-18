import { RelayResponse } from '@dogu-tech/device-client-common';
import _ from 'lodash';
import { WebDriverEndpointHandlerResult } from '../common/type';

interface NewSessionResponse {
  value: {
    capabilities: {
      'dogu:results': {
        remoteDeviceJobId: string;
      };
    };
  };
}

export function onBeforeNewSessionResponse(relayResponse: RelayResponse, processResult: WebDriverEndpointHandlerResult): RelayResponse {
  _.merge(relayResponse.resBody, { value: { capabilities: { 'dogu:results': { remoteDeviceJobId: processResult.remoteDeviceJobId } } } });
  return relayResponse;
}
