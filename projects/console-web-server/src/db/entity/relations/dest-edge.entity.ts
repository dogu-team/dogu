import { DestEdgeBase, DestJobEdgePropSnake } from '@dogu-private/console';
import { DestId, DEST_EDGE_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from '../decorators';
import { Dest } from '../dest.entity';

@Entity(DEST_EDGE_TABLE_NAME)
export class DestEdge extends BaseEntity implements DestEdgeBase {
  @PrimaryColumn({ type: 'int', name: DestJobEdgePropSnake.dest_id, unsigned: true, nullable: false })
  destId!: DestId;

  @PrimaryColumn({ type: 'int', name: DestJobEdgePropSnake.parent_dest_id, unsigned: true, nullable: false })
  parentDestId!: DestId;

  @ColumnTemplate.CreateDate(DestJobEdgePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.DeleteDate(DestJobEdgePropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => Dest, (dest) => dest.destEdges, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: DestJobEdgePropSnake.dest_id })
  dest?: Dest;
}
