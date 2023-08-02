import { RecordTestScenarioBase, RecordTestScenarioPropSnake } from '@dogu-private/console';
import { ProjectId, RecordTestScenarioId, RECORD_TEST_SCENARIO_TABLE_NAME, UserId } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Project } from './project.entity';
import { RecordTestCase } from './record-test-case.entity';
import { User } from './user.entity';

@Entity(RECORD_TEST_SCENARIO_TABLE_NAME)
export class RecordTestScenario extends BaseEntity implements RecordTestScenarioBase {
  @PrimaryColumn({ type: 'uuid', name: RecordTestScenarioPropSnake.record_test_scenario_id })
  recordTestScenarioId!: RecordTestScenarioId;

  @ColumnTemplate.RelationUuid(RecordTestScenarioPropSnake.project_id)
  projectId!: ProjectId;

  @ColumnTemplate.RelationUuid(RecordTestScenarioPropSnake.creator_id)
  creatorId!: UserId;

  @Column({ type: 'character varying', name: RecordTestScenarioPropSnake.name, nullable: false })
  name!: string;

  @ColumnTemplate.CreateDate(RecordTestScenarioPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RecordTestScenarioPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RecordTestScenarioPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: RecordTestScenarioPropSnake.creator_id })
  creator?: User;

  @ManyToOne(() => Project, (project) => project, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestScenarioPropSnake.project_id })
  project?: Project;

  @OneToMany(() => RecordTestCase, (recordTestCase) => recordTestCase.recordTestScenario, { cascade: ['soft-remove'] })
  recordTestCases?: RecordTestCase[];
}
