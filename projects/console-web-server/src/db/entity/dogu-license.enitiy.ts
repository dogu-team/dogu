import { DoguLicenseBase, DoguLicenseId, DoguLicensePropSnake, DOGU_LICENSE_TABLE_NAME } from '@dogu-private/console';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';

@Entity(DOGU_LICENSE_TABLE_NAME)
export class DoguLicense implements DoguLicenseBase {
  @PrimaryColumn('uuid', { name: DoguLicensePropSnake.dogu_license_id })
  doguLicenseId!: DoguLicenseId;

  @Column({ type: 'character varying', name: DoguLicensePropSnake.license_key })
  licenseKey!: string;

  @ColumnTemplate.CreateDate(DoguLicensePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.DeleteDate(DoguLicensePropSnake.deleted_at)
  deletedAt!: Date | null;
}
