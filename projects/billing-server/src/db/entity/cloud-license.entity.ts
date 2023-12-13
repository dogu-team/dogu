import { BillingCategory, BillingPlanType, CloudLicenseBase, CloudLicenseProp } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { CreatedAt, DeletedAt, UpdatedAt } from '../decorators';
import { BillingOrganization } from './billing-organization.entity';

export const DefaultCloudLicenseCount: Record<BillingPlanType, number> = {
  'live-testing': 1,
  'web-test-automation': 1,
  'mobile-app-test-automation': 1,
  'mobile-game-test-automation': 1,
  'self-device-farm-browser': 1,
  'self-device-farm-mobile': 1,
};

@Entity()
export class CloudLicense implements CloudLicenseBase {
  @PrimaryColumn('uuid')
  cloudLicenseId!: string;

  @Column({ type: 'uuid', unique: true })
  billingOrganizationId!: string;

  @Column({ type: 'uuid', unique: true })
  organizationId!: OrganizationId;

  @Column({ type: 'enum', enum: BillingCategory })
  category!: BillingCategory;

  @Column({ type: 'integer', default: 60 * 60 })
  liveTestingRemainingFreeSeconds!: number;

  @Column({ type: 'integer', default: DefaultCloudLicenseCount['live-testing'] })
  liveTestingParallelCount!: number;

  @Column({ type: 'integer', default: 60 * 60 })
  webTestAutomationRemainingFreeSeconds!: number;

  @Column({ type: 'integer', default: DefaultCloudLicenseCount['web-test-automation'] })
  webTestAutomationParallelCount!: number;

  @Column({ type: 'integer', default: 60 * 60 })
  mobileAppTestAutomationRemainingFreeSeconds!: number;

  @Column({ type: 'integer', default: DefaultCloudLicenseCount['mobile-app-test-automation'] })
  mobileAppTestAutomationParallelCount!: number;

  @Column({ type: 'integer', default: 60 * 60 })
  mobileGameTestAutomationRemainingFreeSeconds!: number;

  @Column({ type: 'integer', default: DefaultCloudLicenseCount['mobile-game-test-automation'] })
  mobileGameTestAutomationParallelCount!: number;

  @Column({ type: 'integer', default: DefaultCloudLicenseCount['self-device-farm-browser'] })
  selfDeviceBrowserCount!: number;

  @Column({ type: 'integer', default: DefaultCloudLicenseCount['self-device-farm-mobile'] })
  selfDeviceMobileCount!: number;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;

  @OneToOne(() => BillingOrganization)
  @JoinColumn({ name: CloudLicenseProp.billingOrganizationId })
  billingOrganization?: BillingOrganization;
}
