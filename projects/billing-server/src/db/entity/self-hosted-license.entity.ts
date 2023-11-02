import { BillingOrganizationProp, SelfHostedLicenseBase } from '@dogu-private/console';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { BillingOrganization } from './billing-organization.entity';
import { CreatedAt, DateColumn, DeletedAt, UpdatedAt } from './util/decorators';

@Entity()
export class SelfHostedLicense implements SelfHostedLicenseBase {
  @PrimaryColumn('uuid')
  selfHostedLicenseId!: string;

  @Column({ type: 'character varying' })
  licenseKey!: string;

  /**
   * @deprecated use organizationId instead
   */
  @Column({ type: 'character varying', nullable: true })
  companyName!: string | null;

  @Column({ type: 'character varying', nullable: true, unique: true })
  organizationId!: string | null;

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

  @OneToOne(() => BillingOrganization, { nullable: true, createForeignKeyConstraints: false })
  @JoinColumn({ referencedColumnName: BillingOrganizationProp.organizationId })
  billingOrganization?: BillingOrganization | null;
}
