import { Serial } from '@dogu-private/types';
import { DevicePortContext } from '../types/device-port-context';
import { getFreePort } from '../util/net';

export async function createPortContext(serial: Serial): Promise<DevicePortContext> {
  // string to hash
  const hash = serial.split('').reduce((prevHash, currVal) => ((prevHash << 5) - prevHash + currVal.charCodeAt(0)) | 0, 0);
  const hashModuloed = hash % 100;
  const freeHostPort1 = await getFreePort([], hashModuloed);
  const freeHostPort2 = await getFreePort([freeHostPort1], hashModuloed);
  const freeHostPort3 = await getFreePort([freeHostPort1, freeHostPort2], hashModuloed);
  return {
    freeHostPort1,
    freeHostPort2,
    freeHostPort3,
  };
}
