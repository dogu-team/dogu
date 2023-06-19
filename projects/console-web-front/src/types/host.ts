import { HostId } from '@dogu-private/types';

export interface HeartBeat {
  [hostId: HostId]: { isAlive: boolean; deviceIds: { [deviceId: string]: boolean }[] };
}
