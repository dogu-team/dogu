import { RecordTestStepActionBase, RecordTestStepActionPropSnake, RecordTestStepPropCamel } from '@dogu-private/console';
import { RecordTestStepActionId, RecordTestStepId, RECORD_TEST_STEP_ACTION_TABLE_NAME, RECORD_TEST_STEP_ACTION_TYPE } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { RecordTestStep } from './record-test-step.entity';

@Entity(RECORD_TEST_STEP_ACTION_TABLE_NAME)
export class RecordTestStepAction extends BaseEntity implements RecordTestStepActionBase {
  @PrimaryColumn({ type: 'uuid', name: RecordTestStepActionPropSnake.record_test_step_action_id })
  recordTestStepActionId!: RecordTestStepActionId;

  @ColumnTemplate.RelationUuid(RecordTestStepActionPropSnake.record_test_step_id)
  recordTestStepId!: RecordTestStepId;

  @Column({ type: 'smallint', name: RecordTestStepActionPropSnake.type, default: RECORD_TEST_STEP_ACTION_TYPE.UNSPECIFIED, nullable: false })
  type!: RECORD_TEST_STEP_ACTION_TYPE;

  @Column({ type: 'character varying', name: RecordTestStepActionPropSnake.screenshot_url, nullable: false })
  screenshotUrl!: string;

  @ColumnTemplate.CreateDate(RecordTestStepActionPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RecordTestStepActionPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RecordTestStepActionPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => RecordTestStep, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestStepActionPropSnake.record_test_step_id, referencedColumnName: RecordTestStepPropCamel.recordTestStepId })
  recordTestStep?: RecordTestStep;
}
