import { RecordTestCaseAndRecordTestStepBase, RecordTestCaseAndRecordTestStepPropSnake, RecordTestCasePropCamel, RecordTestStepPropCamel } from '@dogu-private/console';
import { RecordTestCaseId, RecordTestStepId, RECORD_TEST_CASE_AND_RECORD_TEST_STEP_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from '../decorators';
import { RecordTestCase } from '../record-test-case.entity';
import { RecordTestStep } from '../record-test-step.entity';

@Entity(RECORD_TEST_CASE_AND_RECORD_TEST_STEP_TABLE_NAME)
export class RecordTestCaseAndRecordTestStep extends BaseEntity implements RecordTestCaseAndRecordTestStepBase {
  @PrimaryColumn({ type: 'uuid', name: RecordTestCaseAndRecordTestStepPropSnake.record_test_case_id })
  recordTestCaseId!: RecordTestCaseId;

  @PrimaryColumn({ type: 'uuid', name: RecordTestCaseAndRecordTestStepPropSnake.record_test_step_id })
  recordTestStepId!: RecordTestStepId;

  @ColumnTemplate.RelationUuid(RecordTestCaseAndRecordTestStepPropSnake.prev_record_test_step_id, true)
  prevRecordTestStepId!: RecordTestStepId | null;

  @ColumnTemplate.CreateDate(RecordTestCaseAndRecordTestStepPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RecordTestCaseAndRecordTestStepPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RecordTestCaseAndRecordTestStepPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => RecordTestCase, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestCaseAndRecordTestStepPropSnake.record_test_case_id, referencedColumnName: RecordTestCasePropCamel.recordTestCaseId })
  recordTestCase?: RecordTestCase;

  @ManyToOne(() => RecordTestStep, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestCaseAndRecordTestStepPropSnake.prev_record_test_step_id, referencedColumnName: RecordTestStepPropCamel.recordTestStepId })
  prevRecordTestStep?: RecordTestStep | null;

  @ManyToOne(() => RecordTestStep, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestCaseAndRecordTestStepPropSnake.record_test_step_id, referencedColumnName: RecordTestStepPropCamel.recordTestStepId })
  recordTestStep?: RecordTestStep;
}
