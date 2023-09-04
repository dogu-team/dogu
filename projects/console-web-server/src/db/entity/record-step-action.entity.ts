import { RecordStepActionBase, RecordStepActionPropSnake } from '@dogu-private/console';
import { RecordCaseActionId, RecordStepActionId, RecordTestStepId, RECORD_PIPELINE_STATE, RECORD_STEP_ACTION_TABLE_NAME, RECORD_TEST_STEP_ACTION_TYPE } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { RecordCaseAction } from './record-case-action.entity';
import { RecordTestStep } from './record-test-step.entity';

@Entity(RECORD_STEP_ACTION_TABLE_NAME)
export class RecordStepAction extends BaseEntity implements RecordStepActionBase {
  @PrimaryColumn({ type: 'uuid', name: RecordStepActionPropSnake.record_step_action_id })
  recordStepActionId!: RecordStepActionId;

  @ColumnTemplate.RelationUuid(RecordStepActionPropSnake.record_case_action_id)
  recordCaseActionId!: RecordCaseActionId;

  @ColumnTemplate.RelationUuid(RecordStepActionPropSnake.record_test_step_id)
  recordTestStepId!: RecordTestStepId;

  @Column({ type: 'smallint', name: RecordStepActionPropSnake.state, default: RECORD_PIPELINE_STATE.WAITING, nullable: false })
  state!: RECORD_PIPELINE_STATE;

  @Column({ type: 'int', name: RecordStepActionPropSnake.index, unsigned: true, nullable: false })
  index!: number;

  @Column({ type: 'smallint', name: RecordStepActionPropSnake.type, default: RECORD_TEST_STEP_ACTION_TYPE.UNSPECIFIED, nullable: false })
  type!: RECORD_TEST_STEP_ACTION_TYPE;

  @Column({ type: 'json', name: RecordStepActionPropSnake.record_test_step_info })
  recordTestStepInfo!: Record<string, unknown>;

  @ColumnTemplate.CreateDate(RecordStepActionPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RecordStepActionPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.Date(RecordStepActionPropSnake.in_progress_at, true)
  inProgressAt!: Date | null;

  @ColumnTemplate.Date(RecordStepActionPropSnake.completed_at, true)
  completedAt!: Date | null;

  @ColumnTemplate.DeleteDate(RecordStepActionPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => RecordCaseAction, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordStepActionPropSnake.record_case_action_id })
  recordCaseAction?: RecordCaseAction;

  @ManyToOne(() => RecordTestStep, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordStepActionPropSnake.record_test_step_id })
  recordTestStep?: RecordTestStep;
}
