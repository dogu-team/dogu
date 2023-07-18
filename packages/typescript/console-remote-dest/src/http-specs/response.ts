import { DEST_STATE, DEST_TYPE, RemoteDestId, RemoteDestPublic, RemoteDeviceJobId } from '@dogu-tech/types';

export class CreateRemoteDestResponse {
  dests!: RemoteDestData[];
}

export class RemoteDestData implements Pick<RemoteDestPublic, 'remoteDestId' | 'remoteDeviceJobId' | 'name' | 'index' | 'state' | 'type'> {
  remoteDestId!: RemoteDestId;
  remoteDeviceJobId!: RemoteDeviceJobId;
  name!: string;
  index!: number;
  state!: DEST_STATE;
  type!: DEST_TYPE;
  children!: RemoteDestData[];
}
