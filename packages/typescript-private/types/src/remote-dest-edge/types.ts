import { RemoteDestId } from '@dogu-tech/types';

export const REMOTE_DEST_EDGE_TABLE_NAME = 'remote_dest_edge';

export interface RemoteDestEdge {
  remoteDestId: RemoteDestId;
  parentDestId: RemoteDestId;
  createdAt: Date;
  deletedAt: Date | null;
}
