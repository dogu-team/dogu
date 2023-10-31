import { BillingMethodNiceBase, BillingMethodNicePropCamel, BillingMethodNicePropSnake, SelfHostedLicenseBase } from '@dogu-private/console';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { CloudLicense } from './cloud-license.entity';
import { ColumnTemplate } from './util/decorators';

@Entity('billing_method_nice')
export class BillingMethodNice implements BillingMethodNiceBase {
  @PrimaryColumn('uuid', { name: BillingMethodNicePropSnake.billing_method_nice_id })
  billingMethodNiceId!: string;

  @Column({ type: 'uuid', name: BillingMethodNicePropSnake.cloud_license_id, nullable: true })
  cloudLicenseId!: string | null;

  @Column({ type: 'uuid', name: BillingMethodNicePropSnake.self_hosted_license_id, nullable: true })
  selfHostedLicenseId!: string | null;

  @ColumnTemplate.CreateDate(BillingMethodNicePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(BillingMethodNicePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(BillingMethodNicePropSnake.deleted_at)
  deletedAt!: Date | null;

  @OneToOne(() => CloudLicense, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: BillingMethodNicePropSnake.cloud_license_id, referencedColumnName: BillingMethodNicePropCamel.cloudLicenseId })
  cloudLicense?: CloudLicense;

  selfHostedLicense?: SelfHostedLicenseBase;
}
