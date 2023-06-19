import { RoutineJobBase, RoutineJobPropSnake } from '@dogu-private/console';
import { PIPELINE_STATUS, RoutineJobId, RoutinePipelineId, ROUTINE_JOB_NAME_MAX_LENGTH, ROUTINE_JOB_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { RoutineDeviceJob } from './device-job.entity';
import { RoutinePipeline } from './pipeline.entity';
import { RoutineJobEdge } from './relations/job-edge.entity';

@Entity(ROUTINE_JOB_TABLE_NAME)
export class RoutineJob extends BaseEntity implements RoutineJobBase {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: `${RoutineJobPropSnake.routine_job_id}`, unsigned: true })
  routineJobId!: RoutineJobId;

  @Column({ name: `${RoutineJobPropSnake.routine_pipeline_id}`, type: 'int', unsigned: true, nullable: false })
  routinePipelineId!: RoutinePipelineId;

  @Column({ type: 'character varying', name: `${RoutineJobPropSnake.name}`, length: ROUTINE_JOB_NAME_MAX_LENGTH, nullable: false })
  name!: string;

  @Column({ type: 'smallint', name: `${RoutineJobPropSnake.status}`, default: PIPELINE_STATUS.WAITING, unsigned: true, nullable: false })
  status!: PIPELINE_STATUS;

  @Column({ type: 'int', name: `${RoutineJobPropSnake.index}`, unsigned: true, nullable: false })
  index!: number;

  @Column({ type: 'smallint', name: `${RoutineJobPropSnake.record}`, unsigned: true, default: 0, nullable: false })
  record!: number;

  @ColumnTemplate.CreateDate(`${RoutineJobPropSnake.created_at}`)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(`${RoutineJobPropSnake.updated_at}`)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(`${RoutineJobPropSnake.deleted_at}`)
  deletedAt!: Date | null;

  @ColumnTemplate.Date(`${RoutineJobPropSnake.in_progress_at}`, true)
  inProgressAt!: Date | null;

  @ColumnTemplate.Date(`${RoutineJobPropSnake.completed_at}`, true)
  completedAt!: Date | null;

  @OneToMany(() => RoutineJobEdge, (jobEdge) => jobEdge.routineJob, { cascade: ['soft-remove'] })
  routineJobEdges?: RoutineJobEdge[];

  @ManyToOne(() => RoutinePipeline, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: `${RoutineJobPropSnake.routine_pipeline_id}` })
  routinePipeline?: RoutinePipeline;

  @OneToMany(() => RoutineDeviceJob, (deviceJob) => deviceJob.routineJob, { cascade: ['soft-remove'] })
  routineDeviceJobs?: RoutineDeviceJob[];
}
