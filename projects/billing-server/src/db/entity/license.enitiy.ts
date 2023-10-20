import { LicenseBase, LicenseId, LicensePropSnake, LicenseSelfHostedTierId, LicenseTokenId, LicenseTokenPropCamel, LicenseType, LicenseTypeKey } from '@dogu-private/console';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { LicenseSelfHostedTier } from './license-self-hosted-tier.enitiy';
import { LicenseToken } from './license-token.enitiy';
import { ColumnTemplate } from './util/decorators';
const LICENSE_TABLE_NAME = 'license';
@Entity(LICENSE_TABLE_NAME)
export class License extends BaseEntity implements LicenseBase {
  @PrimaryColumn('uuid', { name: LicensePropSnake.license_id })
  licenseId!: LicenseId;

  @Column({ type: 'integer', name: LicensePropSnake.license_tier_id, nullable: false })
  licenseTierId!: LicenseSelfHostedTierId;

  @Column({ type: 'enum', name: LicensePropSnake.type, enum: LicenseTypeKey, nullable: false })
  type!: LicenseType;

  @ColumnTemplate.RelationUuid(LicensePropSnake.license_token_id)
  licenseTokenId!: LicenseTokenId;

  @Column({ type: 'character varying', name: LicensePropSnake.organization_id, unique: true, nullable: true })
  organizationId!: string | null;

  @Column({ type: 'character varying', name: LicensePropSnake.company_name, unique: false, nullable: true })
  companyName!: string | null;

  @ColumnTemplate.CreateDate(LicensePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.DeleteDate(LicensePropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => LicenseToken, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: LicensePropSnake.license_token_id, referencedColumnName: LicenseTokenPropCamel.licenseTokenId })
  licenseToken?: LicenseToken;

  @ColumnTemplate.CreateDate(LicensePropSnake.last_accessed_at)
  lastAccessedAt!: Date;

  // @ManyToOne(() => LicenseSelfHostedTier, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  // @JoinColumn({ name: LicensePropSnake.license_tier_id, referencedColumnName: LicenseSelfHostedTierPropCamel.lis })
  licenseTier?: LicenseSelfHostedTier;
}
