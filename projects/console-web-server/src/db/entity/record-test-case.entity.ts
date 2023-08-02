import { RecordTestCaseBase, RecordTestCasePropCamel, RecordTestCasePropSnake } from '@dogu-private/console';
import { RecordTestCaseId, RecordTestScenarioId, RECORD_TEST_CASE_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { RecordTestScenario } from './record-test-scenario.entity';
import { RecordTestStep } from './record-test-step.entity';

@Entity(RECORD_TEST_CASE_TABLE_NAME)
export class RecordTestCase extends BaseEntity implements RecordTestCaseBase {
  @PrimaryColumn({ type: 'uuid', name: RecordTestCasePropSnake.record_test_case_id })
  recordTestCaseId!: RecordTestCaseId;

  @ColumnTemplate.RelationUuid(RecordTestCasePropSnake.prev_record_test_case_id)
  prevRecordTestCaseId!: RecordTestCaseId | null;

  @ColumnTemplate.RelationUuid(RecordTestCasePropSnake.record_test_scenario_id)
  recordTestScenarioId!: RecordTestScenarioId;

  @Column({ type: 'character varying', name: RecordTestCasePropSnake.name, nullable: false })
  name!: string;

  @ColumnTemplate.CreateDate(RecordTestCasePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RecordTestCasePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RecordTestCasePropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => RecordTestCase, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestCasePropSnake.prev_record_test_case_id, referencedColumnName: RecordTestCasePropCamel.recordTestCaseId })
  prevRecordTestCase?: RecordTestCaseBase | null;

  @ManyToOne(() => RecordTestScenario, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestCasePropSnake.record_test_scenario_id, referencedColumnName: RecordTestCasePropCamel.recordTestScenarioId })
  recordTestScenario?: RecordTestScenario;

  @OneToMany(() => RecordTestStep, (recordTestStep) => recordTestStep.recordTestCase, { cascade: ['soft-remove'] })
  recordTestSteps?: RecordTestStep[];
}
