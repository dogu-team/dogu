import { RemoteDestEdgeBase, RemoteDestEdgeBasePropSnake } from '@dogu-private/console';
import { RemoteDestId, REMOTE_DEST_EDGE_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from '../decorators';
import { RemoteDest } from '../remote-dest.entity';

@Entity(REMOTE_DEST_EDGE_TABLE_NAME)
export class RemoteDestEdge extends BaseEntity implements RemoteDestEdgeBase {
  @PrimaryColumn({ type: 'uuid', name: RemoteDestEdgeBasePropSnake.remote_dest_id })
  remoteDestId!: RemoteDestId;

  @PrimaryColumn({ type: 'uuid', name: RemoteDestEdgeBasePropSnake.parent_remote_dest_id, nullable: false })
  parentRemoteDestId!: RemoteDestId;

  @ColumnTemplate.CreateDate(RemoteDestEdgeBasePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.DeleteDate(RemoteDestEdgeBasePropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => RemoteDest, (remoteDest) => remoteDest.remoteDestEdges, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RemoteDestEdgeBasePropSnake.remote_dest_id })
  remoteDest?: RemoteDest;
}
