import { RoutineBase, RoutinePropSnake } from '@dogu-private/console';
import { ProjectId, RoutineId, ROUTINE_NAME_MAX_LENGTH, ROUTINE_TABLE_NAME } from '@dogu-private/types';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Project, RoutinePipeline } from '.';
import { ColumnTemplate } from './decorators';

@Entity(ROUTINE_TABLE_NAME)
export class Routine implements RoutineBase {
  @PrimaryGeneratedColumn('uuid', { name: `${RoutinePropSnake.routine_id}` })
  routineId!: RoutineId;

  @ColumnTemplate.RelationUuid(RoutinePropSnake.project_id)
  projectId!: ProjectId;

  @Column({ type: 'character varying', name: `${RoutinePropSnake.name}`, length: ROUTINE_NAME_MAX_LENGTH, nullable: false })
  name!: string;

  @Column({ type: 'int', name: `${RoutinePropSnake.last_index}`, unsigned: true, default: 0, nullable: false })
  lastIndex!: number;

  @ColumnTemplate.CreateDate(`${RoutinePropSnake.created_at}`)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(`${RoutinePropSnake.updated_at}`)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(`${RoutinePropSnake.deleted_at}`)
  deletedAt!: Date | null;

  @OneToMany(() => RoutinePipeline, (pipeline) => pipeline.routine, { cascade: ['soft-remove'] })
  routinePipelines?: RoutinePipeline[];

  @ManyToOne(() => Project, (project) => project.routines, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: `${RoutinePropSnake.project_id}` })
  project?: Project;
}
