import { RecordTestStepBase, RecordTestStepPropCamel, RecordTestStepPropSnake } from '@dogu-private/console';
import { RecordTestCaseId, RecordTestStepId, RECORD_TEST_STEP_TABLE_NAME, TEST_STEP_TYPE } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { RecordTestCase } from './record-test-case.entity';

@Entity(RECORD_TEST_STEP_TABLE_NAME)
export class RecordTestStep extends BaseEntity implements RecordTestStepBase {
  @PrimaryColumn({ type: 'uuid', name: RecordTestStepPropSnake.record_test_step_id })
  recordTestStepId!: RecordTestStepId;

  @ColumnTemplate.RelationUuid(RecordTestStepPropSnake.prev_record_test_step_id)
  prevRecordTestStepId!: RecordTestStepId | null;

  @ColumnTemplate.RelationUuid(RecordTestStepPropSnake.record_test_case_id)
  recordTestCaseId!: RecordTestCaseId;

  @Column({ type: 'character varying', name: RecordTestStepPropSnake.name, nullable: false })
  name!: string;

  @Column({ type: 'smallint', name: RecordTestStepPropSnake.type, default: TEST_STEP_TYPE.UNSPECIFIED, nullable: false })
  type!: TEST_STEP_TYPE;

  @ColumnTemplate.CreateDate(RecordTestStepPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RecordTestStepPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RecordTestStepPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => RecordTestStep, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestStepPropSnake.prev_record_test_step_id, referencedColumnName: RecordTestStepPropCamel.recordTestStepId })
  prevRecordTestStep?: RecordTestStepBase | null;

  @ManyToOne(() => RecordTestCase, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestStepPropSnake.record_test_case_id, referencedColumnName: RecordTestStepPropCamel.recordTestCaseId })
  recordTestCase?: RecordTestCase;
}
