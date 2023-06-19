import { Serial } from '@dogu-private/types';
import { DevicePortContext } from '../types/device-port-context';
import { getFreePort } from '../util/net';

export async function createPortContext(serial: Serial): Promise<DevicePortContext> {
  // string to hash
  const hash = serial.split('').reduce((prevHash, currVal) => ((prevHash << 5) - prevHash + currVal.charCodeAt(0)) | 0, 0);
  const hashModuloed = hash % 100;
  const deviceAgentForwardPort = await getFreePort([], hashModuloed);
  const deviceAgentSecondForwardPort = await getFreePort([deviceAgentForwardPort], hashModuloed);
  return {
    deviceAgentForwardPort,
    deviceAgentSecondForwardPort,
  };
}
