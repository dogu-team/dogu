import { RecordDeviceJobBase, RecordDeviceJobPropSnake } from '@dogu-private/console';
import { DeviceId, RecordDeviceJobId, RecordPipelineId, RECORD_DEVICE_JOB_TABLE_NAME, RECORD_PIPELINE_STATE } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { RecordAction } from './record-action.entity';
import { RecordPipeline } from './record-pipeline.entity';

@Entity(RECORD_DEVICE_JOB_TABLE_NAME)
export class RecordDeviceJob extends BaseEntity implements RecordDeviceJobBase {
  @PrimaryColumn({ type: 'uuid', name: RecordDeviceJobPropSnake.record_device_job_id })
  recordDeviceJobId!: RecordDeviceJobId;

  @ColumnTemplate.RelationUuid(RecordDeviceJobPropSnake.record_pipeline_id)
  recordPipelineId!: RecordPipelineId;

  @Column({ type: 'smallint', name: RecordDeviceJobPropSnake.state, default: RECORD_PIPELINE_STATE.WAITING, nullable: false })
  state!: RECORD_PIPELINE_STATE;

  @ColumnTemplate.RelationUuid(RecordDeviceJobPropSnake.device_id)
  deviceId!: DeviceId;

  @ColumnTemplate.CreateDate(RecordDeviceJobPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RecordDeviceJobPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.Date(RecordDeviceJobPropSnake.in_progress_at, true)
  inProgressAt!: Date | null;

  @ColumnTemplate.Date(RecordDeviceJobPropSnake.completed_at, true)
  completedAt!: Date | null;

  @ColumnTemplate.DeleteDate(RecordDeviceJobPropSnake.deleted_at)
  deletedAt!: Date | null;

  @Column({ type: 'json', name: RecordDeviceJobPropSnake.device_info })
  deviceInfo!: Record<string, unknown>;

  @ManyToOne(() => RecordPipeline, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordDeviceJobPropSnake.record_pipeline_id })
  recordPipeline?: RecordPipeline;

  @OneToMany(() => RecordAction, (recordAction) => recordAction.recordDeviceJob, { cascade: ['soft-remove'] })
  recordAction?: RecordAction[];
}
