import { RelayResponse } from '@dogu-tech/device-client-common';
import _ from 'lodash';
import { env } from '../../../env';
import { WebDriverEndpointHandlerResult } from '../common/type';

export function onBeforeNewSessionResponse(relayResponse: RelayResponse, processResult: WebDriverEndpointHandlerResult): RelayResponse {
  const seCdp = _.get(relayResponse.resBody, 'value.capabilities.se:cdp') as string | undefined;
  if (seCdp) {
    const seCdpUrl = new URL(seCdp);
    const doguApiBaseUrl = new URL(env.DOGU_API_BASE_URL);
    seCdpUrl.protocol = doguApiBaseUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    seCdpUrl.host = doguApiBaseUrl.host;
    seCdpUrl.port = doguApiBaseUrl.port;
    const replaced = seCdpUrl.toString();
    _.merge(relayResponse.resBody, { value: { capabilities: { 'se:cdp': replaced } } });
  }
  _.merge(relayResponse.resBody, { value: { capabilities: { 'dogu:results': { remoteDeviceJobId: processResult.remoteDeviceJobId } } } });
  return relayResponse;
}

export function onBeforeDeleteSessionResponse(relayResponse: RelayResponse, resultUrl: string): RelayResponse {
  _.merge(relayResponse.resBody, { value: { capabilities: { 'dogu:results': { resultUrl } } } });
  return relayResponse;
}
