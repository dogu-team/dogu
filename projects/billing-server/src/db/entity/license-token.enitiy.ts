import { LicenseTokenBase, LicenseTokenId, LicenseTokenPropSnake, LICENSE_TOKEN_TABEL_NAME } from '@dogu-private/console';
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { License } from './license.enitiy';
import { ColumnTemplate } from './util/decorators';

@Entity(LICENSE_TOKEN_TABEL_NAME)
export class LicenseToken extends BaseEntity implements LicenseTokenBase {
  @PrimaryColumn('uuid', { name: LicenseTokenPropSnake.license_token_id })
  licenseTokenId!: LicenseTokenId;

  @Column({ type: 'character varying', name: LicenseTokenPropSnake.token, unique: true, nullable: false })
  token!: string;

  @ColumnTemplate.CreateDate(LicenseTokenPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.Date(LicenseTokenPropSnake.expired_at, true)
  expiredAt!: Date | null;

  @ColumnTemplate.DeleteDate(LicenseTokenPropSnake.deleted_at)
  deletedAt!: Date | null;

  @OneToMany(() => License, (license) => license.licenseToken, { cascade: ['soft-remove'] })
  license?: License;
}
