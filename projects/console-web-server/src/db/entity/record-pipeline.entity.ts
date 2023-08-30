import { RecordPipelineBase, RecordPipelinePropSnake } from '@dogu-private/console';
import { CREATOR_TYPE, ProjectId, RecordPipelineId, RecordTestScenarioId, RECORD_PIPELINE_STATE, RECORD_PIPELINE_TABLE_NAME, UserId } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Project } from './project.entity';
import { RecordDeviceJob } from './record-device-job.entity';
import { RecordTestScenario } from './record-test-scenario.entity';
import { User } from './user.entity';

@Entity(RECORD_PIPELINE_TABLE_NAME)
export class RecordPipeline extends BaseEntity implements RecordPipelineBase {
  @PrimaryColumn({ type: 'uuid', name: RecordPipelinePropSnake.record_pipeline_id })
  recordPipelineId!: RecordPipelineId;

  @ColumnTemplate.RelationUuid(RecordPipelinePropSnake.project_id)
  projectId!: ProjectId;

  @ColumnTemplate.RelationUuid(RecordPipelinePropSnake.record_test_scenario_id)
  recordTestScenarioId!: RecordTestScenarioId;

  @Column({ type: 'smallint', name: RecordPipelinePropSnake.state, default: RECORD_PIPELINE_STATE.WAITING, nullable: false })
  state!: RECORD_PIPELINE_STATE;

  @Column({ type: 'smallint', name: RecordPipelinePropSnake.creator_type, default: CREATOR_TYPE.UNSPECIFIED, nullable: false })
  creatorType!: CREATOR_TYPE;

  @ColumnTemplate.RelationUuid(RecordPipelinePropSnake.creator_id, true)
  creatorId!: UserId | null;

  @ColumnTemplate.RelationUuid(RecordPipelinePropSnake.canceler_id, true)
  cancelerId!: UserId | null;

  @ColumnTemplate.CreateDate(RecordPipelinePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RecordPipelinePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.Date(RecordPipelinePropSnake.in_progress_at, true)
  inProgressAt!: Date | null;

  @ColumnTemplate.Date(RecordPipelinePropSnake.completed_at, true)
  completedAt!: Date | null;

  @ColumnTemplate.DeleteDate(RecordPipelinePropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: RecordPipelinePropSnake.creator_id })
  creator?: User;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: RecordPipelinePropSnake.canceler_id })
  canceler?: User;

  @ManyToOne(() => RecordTestScenario, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordPipelinePropSnake.record_test_scenario_id })
  recordTestScenario?: RecordTestScenario;

  @OneToMany(() => RecordDeviceJob, (recordDeviceJob) => recordDeviceJob.recordPipeline, { cascade: ['soft-remove'] })
  recordDeviceJobs?: RecordDeviceJob[];

  @ManyToOne(() => Project, (project) => project, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordPipelinePropSnake.project_id })
  project?: Project;
}
