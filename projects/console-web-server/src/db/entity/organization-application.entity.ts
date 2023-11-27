import { OrganizationApplicationBase, OrganizationApplicationPropSnake } from '@dogu-private/console';
import { CREATOR_TYPE, OrganizationId, UserId } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { ColumnTemplate } from './decorators';
import { Organization } from './organization.entity';
import { User } from './user.entity';

@Entity('organization_application')
export class OrganizationApplication extends BaseEntity implements OrganizationApplicationBase {
  @PrimaryColumn({ type: 'uuid', name: OrganizationApplicationPropSnake.organization_application_id, nullable: false })
  organizationApplicationId!: string;

  @ColumnTemplate.RelationUuid(OrganizationApplicationPropSnake.organization_id)
  organizationId!: OrganizationId;

  @ColumnTemplate.RelationUuid(OrganizationApplicationPropSnake.creator_id, true)
  creatorId!: UserId | null;

  @Column({ type: 'smallint', name: OrganizationApplicationPropSnake.creator_type, default: CREATOR_TYPE.UNSPECIFIED, nullable: false })
  creatorType!: CREATOR_TYPE;

  @Column({ type: 'character varying', name: OrganizationApplicationPropSnake.name, nullable: false })
  name!: string;

  @Column({ type: 'character varying', name: OrganizationApplicationPropSnake.icon_file_name, nullable: true })
  iconFileName!: string | null;

  @Column({ type: 'character varying', name: OrganizationApplicationPropSnake.file_name, nullable: false })
  fileName!: string;

  @Column({ type: 'character varying', name: OrganizationApplicationPropSnake.file_extension, nullable: false })
  fileExtension!: string;

  // constraint --> 5gb
  @Column({ type: 'bigint', name: OrganizationApplicationPropSnake.file_size, nullable: false })
  fileSize!: number;

  @Column({ type: 'character varying', name: OrganizationApplicationPropSnake.package, nullable: false })
  package!: string;

  @Column({ type: 'character varying', name: OrganizationApplicationPropSnake.version, nullable: false })
  version!: string;

  @Column({ type: 'bigint', name: OrganizationApplicationPropSnake.version_code, nullable: false, default: 0 })
  versionCode!: number;

  @Column({ type: 'smallint', name: OrganizationApplicationPropSnake.is_latest, nullable: false, default: 0 })
  isLatest!: number;

  @ColumnTemplate.CreateDate(OrganizationApplicationPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(OrganizationApplicationPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(OrganizationApplicationPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => User, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: OrganizationApplicationPropSnake.creator_id })
  creator!: User;

  @ManyToOne(() => Organization, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: OrganizationApplicationPropSnake.organization_id })
  organization!: Organization;
}
