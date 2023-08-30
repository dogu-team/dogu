import { RecordActionBase, RecordActionPropSnake } from '@dogu-private/console';
import { RecordActionId, RecordDeviceJobId, RecordTestStepId, RECORD_ACTION_TABLE_NAME, RECORD_PIPELINE_STATE, RECORD_TEST_STEP_ACTION_TYPE } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { RecordDeviceJob } from './record-device-job.entity';
import { RecordTestStep } from './record-test-step.entity';

@Entity(RECORD_ACTION_TABLE_NAME)
export class RecordAction extends BaseEntity implements RecordActionBase {
  @PrimaryColumn({ type: 'uuid', name: RecordActionPropSnake.record_action_id })
  recordActionId!: RecordActionId;

  @ColumnTemplate.RelationUuid(RecordActionPropSnake.record_device_job_id)
  recordDeviceJobId!: RecordDeviceJobId;

  @ColumnTemplate.RelationUuid(RecordActionPropSnake.record_test_step_id)
  recordTestStepId!: RecordTestStepId;

  @Column({ type: 'smallint', name: RecordActionPropSnake.state, default: RECORD_PIPELINE_STATE.WAITING, nullable: false })
  state!: RECORD_PIPELINE_STATE;

  @Column({ type: 'int', name: RecordActionPropSnake.index, unsigned: true, nullable: false })
  index!: number;

  @Column({ type: 'smallint', name: RecordActionPropSnake.type, default: RECORD_TEST_STEP_ACTION_TYPE.UNSPECIFIED, nullable: false })
  type!: RECORD_TEST_STEP_ACTION_TYPE;

  @Column({ type: 'json', name: RecordActionPropSnake.action_info })
  actionInfo!: Record<string, unknown>;

  @ColumnTemplate.CreateDate(RecordActionPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RecordActionPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.Date(RecordActionPropSnake.in_progress_at, true)
  inProgressAt!: Date | null;

  @ColumnTemplate.Date(RecordActionPropSnake.completed_at, true)
  completedAt!: Date | null;

  @ColumnTemplate.DeleteDate(RecordActionPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => RecordDeviceJob, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordActionPropSnake.record_device_job_id })
  recordDeviceJob?: RecordDeviceJob;

  @ManyToOne(() => RecordTestStep, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordActionPropSnake.record_test_step_id })
  recordTestStep?: RecordTestStep;
}
