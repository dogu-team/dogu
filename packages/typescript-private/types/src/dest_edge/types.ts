import { DestId } from '@dogu-tech/types';

export const DEST_EDGE_TABLE_NAME = 'dest_edge';

export interface DestEdge {
  destId: DestId;
  parentDestId: DestId;
  createdAt: Date;
  deletedAt: Date | null;
}
