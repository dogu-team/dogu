import { RelayResponse } from '@dogu-tech/device-client-common';
import _ from 'lodash';
import { env } from '../../../env';
import { WebDriverEndpointHandlerResult } from '../common/type';

export const sessionSeCdpMap = new Map<string, string>();

export function onBeforeNewSessionResponse(relayResponse: RelayResponse, processResult: WebDriverEndpointHandlerResult): RelayResponse {
  const seCdp = _.get(relayResponse.resBody, 'value.capabilities.se:cdp') as string | undefined;
  if (seCdp) {
    const seCdpUrl = new URL(seCdp);
    const doguConsoleUrl = new URL(env.DOGU_CONSOLE_URL);
    seCdpUrl.protocol = doguConsoleUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    seCdpUrl.host = doguConsoleUrl.host;
    seCdpUrl.port = `${env.DOGU_CONSOLE_WEB_SERVER_PORT}`;
    const replaced = seCdpUrl.toString();
    _.merge(relayResponse.resBody, { value: { capabilities: { 'se:cdp': replaced } } });
    const sessionId = _.get(relayResponse.resBody, 'value.sessionId') as string | undefined;
    if (!sessionId) {
      throw new Error('sessionId is undefined');
    }
    sessionSeCdpMap.set(sessionId, replaced);
  }
  _.merge(relayResponse.resBody, { value: { capabilities: { 'dogu:results': { remoteDeviceJobId: processResult.remoteDeviceJobId } } } });
  return relayResponse;
}

export function onBeforeDeleteSessionResponse(relayResponse: RelayResponse, resultUrl: string): RelayResponse {
  _.merge(relayResponse.resBody, { value: { capabilities: { 'dogu:results': { resultUrl } } } });
  return relayResponse;
}
