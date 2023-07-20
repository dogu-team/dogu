// import { ProjectKeyBase, ProjectKeyPropSnake, ProjectPropCamel } from '@dogu-private/console';
// import { ProjectId, ProjectKeyId, PROJECT_KEY_TABLE_NAME } from '@dogu-private/types';
// import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
// import { ColumnTemplate } from './decorators';
// import { Project } from './project.entity';

// @Entity(PROJECT_KEY_TABLE_NAME)
// export class ProjectKey extends BaseEntity implements ProjectKeyBase {
//   @PrimaryColumn({ type: 'uuid', name: ProjectKeyPropSnake.project_key_id, nullable: false })
//   projectKeyId!: ProjectKeyId;

//   @ColumnTemplate.RelationUuid(ProjectKeyPropSnake.project_id)
//   projectId!: ProjectId;

//   @Column({ type: 'character varying', name: ProjectKeyPropSnake.key, nullable: false })
//   key!: string;

//   @ColumnTemplate.CreateDate(ProjectKeyPropSnake.created_at)
//   createdAt!: Date;

//   @ColumnTemplate.UpdateDate(ProjectKeyPropSnake.updated_at)
//   updatedAt!: Date;

//   @ColumnTemplate.DeleteDate(ProjectKeyPropSnake.deleted_at)
//   deletedAt!: Date | null;

//   @OneToOne(() => Project, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
//   @JoinColumn({ name: ProjectKeyPropSnake.project_id, referencedColumnName: ProjectPropCamel.projectId })
//   project?: Project;
// }
