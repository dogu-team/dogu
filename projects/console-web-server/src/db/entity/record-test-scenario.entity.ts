import { RecordTestScenarioBase, RecordTestScenarioPropSnake } from '@dogu-private/console';
import { ProjectId, RecordTestScenarioId, RECORD_TEST_SCENARIO_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Project } from './project.entity';
import { RecordTestScenarioAndRecordTestCase } from './relations/record-test-scenario-and-record-test-case.entity';

@Entity(RECORD_TEST_SCENARIO_TABLE_NAME)
export class RecordTestScenario extends BaseEntity implements RecordTestScenarioBase {
  @PrimaryColumn({ type: 'uuid', name: RecordTestScenarioPropSnake.record_test_scenario_id })
  recordTestScenarioId!: RecordTestScenarioId;

  @ColumnTemplate.RelationUuid(RecordTestScenarioPropSnake.project_id)
  projectId!: ProjectId;

  @Column({ type: 'character varying', name: RecordTestScenarioPropSnake.name, nullable: false })
  name!: string;

  @ColumnTemplate.CreateDate(RecordTestScenarioPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RecordTestScenarioPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RecordTestScenarioPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => Project, (project) => project, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestScenarioPropSnake.project_id })
  project?: Project;

  @OneToMany(() => RecordTestScenarioAndRecordTestCase, (recordTestScenarioAndRecordTestCases) => recordTestScenarioAndRecordTestCases.recordTestScenario, {
    cascade: ['soft-remove'],
  })
  recordTestScenarioAndRecordTestCases?: RecordTestScenarioAndRecordTestCase[];
}
