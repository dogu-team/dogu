import { RecordTestCaseBase, RecordTestCasePropSnake } from '@dogu-private/console';
import { ProjectId, RecordTestCaseId, RECORD_TEST_CASE_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Project } from './project.entity';
import { RecordTestCaseAndRecordTestStep } from './relations/record-test-case-and-record-test-step.entity';

@Entity(RECORD_TEST_CASE_TABLE_NAME)
export class RecordTestCase extends BaseEntity implements RecordTestCaseBase {
  @PrimaryColumn({ type: 'uuid', name: RecordTestCasePropSnake.record_test_case_id })
  recordTestCaseId!: RecordTestCaseId;

  @ColumnTemplate.RelationUuid(RecordTestCasePropSnake.project_id)
  projectId!: ProjectId;

  @Column({ type: 'character varying', name: RecordTestCasePropSnake.name, nullable: false })
  name!: string;

  @ColumnTemplate.CreateDate(RecordTestCasePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RecordTestCasePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RecordTestCasePropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => Project, (project) => project, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestCasePropSnake.project_id })
  project?: Project;

  @OneToMany(() => RecordTestCaseAndRecordTestStep, (recordTestCaseAndRecordTestStep) => recordTestCaseAndRecordTestStep.recordTestCase, {
    cascade: ['soft-remove'],
  })
  recordTestCaseAndRecordTestSteps?: RecordTestCaseAndRecordTestStep[];
}