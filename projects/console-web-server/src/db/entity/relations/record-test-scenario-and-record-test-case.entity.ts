import { RecordTestCasePropCamel, RecordTestScenarioAndRecordTestCaseBase, RecordTestScenarioAndRecordTestCasePropSnake, RecordTestScenarioPropCamel } from '@dogu-private/console';
import { RecordTestCaseId, RecordTestScenarioId, RECORD_TEST_SCENARIO_AND_RECORD_TEST_CASE_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from '../decorators';
import { RecordTestCase } from '../record-test-case.entity';
import { RecordTestScenario } from '../record-test-scenario.entity';

@Entity(RECORD_TEST_SCENARIO_AND_RECORD_TEST_CASE_TABLE_NAME)
export class RecordTestScenarioAndRecordTestCase extends BaseEntity implements RecordTestScenarioAndRecordTestCaseBase {
  @PrimaryColumn({ type: 'uuid', name: RecordTestScenarioAndRecordTestCasePropSnake.record_test_scenario_id })
  recordTestScenarioId!: RecordTestScenarioId;

  @PrimaryColumn({ type: 'uuid', name: RecordTestScenarioAndRecordTestCasePropSnake.record_test_case_id })
  recordTestCaseId!: RecordTestCaseId;

  @ColumnTemplate.RelationUuid(RecordTestScenarioAndRecordTestCasePropSnake.prev_record_test_case_id, true)
  prevRecordTestCaseId!: RecordTestCaseId | null;

  @ColumnTemplate.CreateDate(RecordTestScenarioAndRecordTestCasePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RecordTestScenarioAndRecordTestCasePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RecordTestScenarioAndRecordTestCasePropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => RecordTestScenario, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestScenarioAndRecordTestCasePropSnake.record_test_scenario_id, referencedColumnName: RecordTestScenarioPropCamel.recordTestScenarioId })
  recordTestScenario?: RecordTestScenario;

  @ManyToOne(() => RecordTestCase, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestScenarioAndRecordTestCasePropSnake.prev_record_test_case_id, referencedColumnName: RecordTestCasePropCamel.recordTestCaseId })
  prevRecordTestCase?: RecordTestCase | null;

  @ManyToOne(() => RecordTestCase, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestScenarioAndRecordTestCasePropSnake.record_test_case_id, referencedColumnName: RecordTestCasePropCamel.recordTestCaseId })
  recordTestCase?: RecordTestCase;
}
