import { RecordTestStepBase, RecordTestStepPropSnake } from '@dogu-private/console';
import { ProjectId, RecordTestStepId, RECORD_TEST_STEP_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Project } from './project.entity';

@Entity(RECORD_TEST_STEP_TABLE_NAME)
export class RecordTestStep extends BaseEntity implements RecordTestStepBase {
  @PrimaryColumn({ type: 'uuid', name: RecordTestStepPropSnake.record_test_step_id })
  recordTestStepId!: RecordTestStepId;

  @ColumnTemplate.RelationUuid(RecordTestStepPropSnake.project_id)
  projectId!: ProjectId;

  @Column({ type: 'character varying', name: RecordTestStepPropSnake.name, nullable: false })
  name!: string;

  @ColumnTemplate.CreateDate(RecordTestStepPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RecordTestStepPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RecordTestStepPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => Project, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestStepPropSnake.project_id })
  project?: Project;
}
