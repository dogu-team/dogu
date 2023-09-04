import { RecordDeviceJobBase, RecordDeviceJobPropSnake } from '@dogu-private/console';
import { DeviceId, DeviceRunnerId, RecordDeviceJobId, RecordPipelineId, RECORD_DEVICE_JOB_TABLE_NAME, RECORD_PIPELINE_STATE, WebDriverSessionId } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { DeviceRunner } from './device-runner.entity';
import { Device } from './device.entity';
import { RecordCaseAction } from './record-case-action.entity';
import { RecordPipeline } from './record-pipeline.entity';

@Entity(RECORD_DEVICE_JOB_TABLE_NAME)
export class RecordDeviceJob extends BaseEntity implements RecordDeviceJobBase {
  @PrimaryColumn({ type: 'uuid', name: RecordDeviceJobPropSnake.record_device_job_id })
  recordDeviceJobId!: RecordDeviceJobId;

  @ColumnTemplate.RelationUuid(RecordDeviceJobPropSnake.record_pipeline_id)
  recordPipelineId!: RecordPipelineId;

  @Column({ type: 'uuid', name: RecordDeviceJobPropSnake.session_id, nullable: true, unique: true })
  sessionId!: WebDriverSessionId | null;

  @ColumnTemplate.RelationUuid(RecordDeviceJobPropSnake.device_runner_id, true)
  deviceRunnerId!: DeviceRunnerId | null;

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

  @ManyToOne(() => Device, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordDeviceJobPropSnake.device_id })
  device?: Device;

  @ManyToOne(() => DeviceRunner, (deviceRunner) => deviceRunner.recordDeviceJobs, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordDeviceJobPropSnake.device_runner_id })
  deviceRunner?: DeviceRunner;

  @OneToMany(() => RecordCaseAction, (recordCaseAction) => recordCaseAction.recordDeviceJob, { cascade: ['soft-remove'] })
  recordCaseActions?: RecordCaseAction[];
}
