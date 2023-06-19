import { RoutineJobEdgeBase, RoutineJobEdgePropSnake, RoutineJobPropCamel } from '@dogu-private/console';
import { RoutineJobId, ROUTINE_JOB_EDGE_TABLE_NAME } from '@dogu-private/types';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from '../decorators';
import { RoutineJob } from '../job.entity';

@Entity(ROUTINE_JOB_EDGE_TABLE_NAME)
export class RoutineJobEdge implements RoutineJobEdgeBase {
  @PrimaryColumn({ type: 'int', name: RoutineJobEdgePropSnake.routine_job_id, unsigned: true, nullable: false })
  routineJobId!: RoutineJobId;

  @PrimaryColumn({ type: 'int', name: RoutineJobEdgePropSnake.parent_routine_job_id, unsigned: true, nullable: false })
  parentRoutineJobId!: RoutineJobId;

  @ColumnTemplate.CreateDate(RoutineJobEdgePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.DeleteDate(RoutineJobEdgePropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => RoutineJob, (job) => job.routineJobEdges, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RoutineJobEdgePropSnake.routine_job_id, referencedColumnName: RoutineJobPropCamel.routineJobId })
  routineJob?: RoutineJob;

  @ManyToOne(() => RoutineJob, (job) => job.routineJobEdges, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RoutineJobEdgePropSnake.parent_routine_job_id, referencedColumnName: RoutineJobPropCamel.routineJobId })
  parentRoutineJob?: RoutineJob;
}
