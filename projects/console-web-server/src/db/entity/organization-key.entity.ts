import { OrganizationKeyBase, OrganizationKeyPropSnake, OrganizationPropCamel } from '@dogu-private/console';
import { OrganizationId, OrganizationKeyId, ORGANIZATION_KEY_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Organization } from './organization.entity';

@Entity(ORGANIZATION_KEY_TABLE_NAME)
export class OrganizationKey extends BaseEntity implements OrganizationKeyBase {
  @PrimaryColumn({ type: 'uuid', name: OrganizationKeyPropSnake.organization_key_id, nullable: false })
  organizationKeyId!: OrganizationKeyId;

  @ColumnTemplate.RelationUuid(OrganizationKeyPropSnake.organization_id)
  organizationId!: OrganizationId;

  @Column({ type: 'character varying', name: OrganizationKeyPropSnake.key, nullable: false })
  key!: string;

  @ColumnTemplate.CreateDate(OrganizationKeyPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(OrganizationKeyPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(OrganizationKeyPropSnake.deleted_at)
  deletedAt!: Date | null;

  @OneToOne(() => Organization, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: OrganizationKeyPropSnake.organization_id, referencedColumnName: OrganizationPropCamel.organizationId })
  organization?: Organization;
}
