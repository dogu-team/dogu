import { Code } from '@dogu-private/types';

const codeDescriptions: Map<Code, string> = new Map([
  [Code.CODE_HOST_AGENT_INVALID_TOKEN, 'Invalid Token'],
  [Code.CODE_HOST_AGENT_CONNECTION_REFUSED, 'Connection Refused'],
  [Code.CODE_HOST_AGENT_PORT_IN_USE, 'Host Agent Port In Use'],
  [Code.CODE_DEVICE_SERVER_PORT_IN_USE, 'Device Server Port In Use'],
]);

export function codeDescription(code: Code): string {
  return codeDescriptions.get(code) || 'Something went wrong';
}
