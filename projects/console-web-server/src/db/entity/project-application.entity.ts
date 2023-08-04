import { ProjectApplicationBase, ProjectApplicationPropSnake } from '@dogu-private/console';
import { CREATOR_TYPE, OrganizationId, ProjectApplicationId, ProjectId, PROJECT_APPLICATION_TABLE_NAME, UserId } from '@dogu-private/types';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Organization } from './organization.entity';
import { Project } from './project.entity';
import { User } from './user.entity';

@Entity(PROJECT_APPLICATION_TABLE_NAME)
export class ProjectApplication implements ProjectApplicationBase {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: ProjectApplicationPropSnake.project_application_id })
  projectApplicationId!: ProjectApplicationId;

  @ColumnTemplate.RelationUuid(ProjectApplicationPropSnake.organization_id)
  organizationId!: OrganizationId;

  @ColumnTemplate.RelationUuid(ProjectApplicationPropSnake.project_id)
  projectId!: ProjectId;

  @ColumnTemplate.RelationUuid(ProjectApplicationPropSnake.creator_id, true)
  creatorId!: UserId | null;

  @Column({ type: 'smallint', name: ProjectApplicationPropSnake.creator_type, default: CREATOR_TYPE.UNSPECIFIED, nullable: false })
  creatorType!: CREATOR_TYPE;

  @Column({ type: 'character varying', name: ProjectApplicationPropSnake.name, nullable: false })
  name!: string;

  @Column({ type: 'character varying', name: ProjectApplicationPropSnake.icon_file_name, nullable: true })
  iconFileName!: string | null;

  @Column({ type: 'character varying', name: ProjectApplicationPropSnake.file_name, nullable: false })
  fileName!: string;

  @Column({ type: 'character varying', name: ProjectApplicationPropSnake.file_extension, nullable: false })
  fileExtension!: string;

  // constraint --> 5gb
  @Column({ type: 'bigint', name: ProjectApplicationPropSnake.file_size, nullable: false })
  fileSize!: number;

  @Column({ type: 'character varying', name: ProjectApplicationPropSnake.package, nullable: false })
  package!: string;

  @Column({ type: 'character varying', name: ProjectApplicationPropSnake.version, nullable: false })
  version!: string;

  @ColumnTemplate.CreateDate(ProjectApplicationPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(ProjectApplicationPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(ProjectApplicationPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => User, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: ProjectApplicationPropSnake.creator_id })
  creator!: User;

  @ManyToOne(() => Organization, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: ProjectApplicationPropSnake.organization_id })
  organization!: Organization;

  @ManyToOne(() => Project, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: ProjectApplicationPropSnake.project_id })
  project!: Project;
}
