import { DestId, DEST_STATE, DEST_TYPE, RemoteDestPublic, RemoteDeviceJobId } from '@dogu-tech/types';

export class CreateRemoteDestResponse {
  dests!: RemoteDestData[];
}

export class RemoteDestData implements Pick<RemoteDestPublic, 'destId' | 'remoteDeviceJobId' | 'name' | 'index' | 'state' | 'type'> {
  destId!: DestId;
  remoteDeviceJobId!: RemoteDeviceJobId;
  name!: string;
  index!: number;
  state!: DEST_STATE;
  type!: DEST_TYPE;
  children!: RemoteDestData[];
}
