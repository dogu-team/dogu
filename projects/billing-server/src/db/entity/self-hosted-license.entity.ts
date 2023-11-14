import { BillingCategory, SelfHostedLicenseBase, SelfHostedLicenseProp } from '@dogu-private/console';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { CreatedAt, DateColumn, DeletedAt, UpdatedAt } from '../decorators';
import { BillingOrganization } from './billing-organization.entity';

@Entity()
export class SelfHostedLicense implements SelfHostedLicenseBase {
  @PrimaryColumn('uuid')
  selfHostedLicenseId!: string;

  @Column({ type: 'character varying' })
  licenseKey!: string;

  @Column({ type: 'uuid', unique: true })
  organizationId!: string;

  @Column({ type: 'uuid', unique: true })
  billingOrganizationId!: string;

  @Column({ type: 'enum', enum: BillingCategory })
  category!: BillingCategory;

  @Column({ type: 'integer', default: 2 })
  maximumEnabledMobileCount!: number;

  @Column({ type: 'integer', default: 2 })
  maximumEnabledBrowserCount!: number;

  @Column({ type: 'boolean', default: false })
  openApiEnabled!: boolean;

  @Column({ type: 'boolean', default: false })
  doguAgentAutoUpdateEnabled!: boolean;

  @CreatedAt()
  createdAt!: Date;

  @CreatedAt()
  lastAccessAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DateColumn()
  expiredAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;

  @OneToOne(() => BillingOrganization)
  @JoinColumn({ name: SelfHostedLicenseProp.billingOrganizationId })
  billingOrganization?: BillingOrganization;
}
