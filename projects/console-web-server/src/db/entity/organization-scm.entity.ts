import { OrganizationScmBase, OrganizationScmPropCamel, OrganizationScmPropSnake, OrganizationScmServiceType, OrganizationScmType } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Organization } from './organization.entity';

@Entity('organization_scm')
export class OrganizationScm extends BaseEntity implements OrganizationScmBase {
  @PrimaryColumn({ type: 'uuid', name: OrganizationScmPropSnake.organization_scm_id, nullable: false })
  organizationScmId!: string;

  @ColumnTemplate.RelationUuid(OrganizationScmPropSnake.organization_id)
  organizationId!: OrganizationId;

  @Column({ type: 'enum', name: OrganizationScmPropSnake.type, enum: OrganizationScmType, nullable: false })
  type!: OrganizationScmType;

  @Column({ type: 'enum', name: OrganizationScmPropSnake.service_type, enum: OrganizationScmServiceType, nullable: false })
  serviceType!: OrganizationScmServiceType;

  @Column({ type: 'character varying', name: OrganizationScmPropSnake.token, nullable: false })
  token!: string;

  @ColumnTemplate.CreateDate(OrganizationScmPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(OrganizationScmPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(OrganizationScmPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => Organization, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: OrganizationScmPropSnake.organization_id, referencedColumnName: OrganizationScmPropCamel.organizationId })
  organization?: Organization;
}
