import { RecordCaseActionBase, RecordCaseActionPropSnake } from '@dogu-private/console';
import { RecordCaseActionId, RecordDeviceJobId, RecordTestCaseId, RECORD_CASE_ACTION_TABLE_NAME, RECORD_PIPELINE_STATE } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { RecordDeviceJob } from './record-device-job.entity';
import { RecordStepAction } from './record-step-action.entity';
import { RecordTestCase } from './record-test-case.entity';

@Entity(RECORD_CASE_ACTION_TABLE_NAME)
export class RecordCaseAction extends BaseEntity implements RecordCaseActionBase {
  @PrimaryColumn({ type: 'uuid', name: RecordCaseActionPropSnake.record_case_action_id })
  recordCaseActionId!: RecordCaseActionId;

  @ColumnTemplate.RelationUuid(RecordCaseActionPropSnake.record_device_job_id)
  recordDeviceJobId!: RecordDeviceJobId;

  @Column({ type: 'smallint', name: RecordCaseActionPropSnake.state, default: RECORD_PIPELINE_STATE.WAITING, nullable: false })
  state!: RECORD_PIPELINE_STATE;

  @Column({ type: 'int', name: RecordCaseActionPropSnake.index, unsigned: true, nullable: false })
  index!: number;

  @ColumnTemplate.RelationUuid(RecordCaseActionPropSnake.record_test_case_id)
  recordTestCaseId!: RecordTestCaseId;

  @Column({ type: 'json', name: RecordCaseActionPropSnake.record_test_case_info })
  recordTestCaseInfo!: Record<string, unknown>;

  @ColumnTemplate.CreateDate(RecordCaseActionPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RecordCaseActionPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.Date(RecordCaseActionPropSnake.in_progress_at, true)
  inProgressAt!: Date | null;

  @ColumnTemplate.Date(RecordCaseActionPropSnake.completed_at, true)
  completedAt!: Date | null;

  @ColumnTemplate.DeleteDate(RecordCaseActionPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => RecordDeviceJob, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordCaseActionPropSnake.record_device_job_id })
  recordDeviceJob?: RecordDeviceJob;

  @ManyToOne(() => RecordTestCase, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordCaseActionPropSnake.record_test_case_id })
  recordTestCase?: RecordTestCase;

  @OneToMany(() => RecordStepAction, (recordStepAction) => recordStepAction.recordCaseAction, { cascade: ['soft-remove'] })
  recordStepActions?: RecordStepAction[];
}
