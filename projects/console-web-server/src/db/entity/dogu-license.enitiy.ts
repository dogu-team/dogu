import { DoguLicenseBase, DoguLicenseId, DoguLicensePropSnake, DOGU_LICENSE_TABLE_NAME, LicenseType, LicenseTypeKey } from '@dogu-private/console';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';

@Entity(DOGU_LICENSE_TABLE_NAME)
export class DoguLicense implements DoguLicenseBase {
  @PrimaryColumn('uuid', { name: DoguLicensePropSnake.dogu_license_id })
  doguLicenseId!: DoguLicenseId;

  @Column({ type: 'enum', name: DoguLicensePropSnake.type, enum: [LicenseTypeKey], nullable: false })
  type!: LicenseType;

  @Column({ type: 'character varying', name: DoguLicensePropSnake.token, unique: true, nullable: false })
  token!: string;

  @Column({ type: 'character varying', name: DoguLicensePropSnake.organization_id, unique: true, nullable: true })
  organizationId!: string | null;

  @Column({ type: 'character varying', name: DoguLicensePropSnake.company_name, unique: true, nullable: true })
  companyName!: string | null;

  @ColumnTemplate.CreateDate(DoguLicensePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.DeleteDate(DoguLicensePropSnake.deleted_at)
  deletedAt!: Date | null;
}
