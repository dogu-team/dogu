import { CloudLicenseBase, CloudLicenseProp } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { CreatedAt, DeletedAt, UpdatedAt } from '../decorators';
import { BillingOrganization } from './billing-organization.entity';

@Entity()
export class CloudLicense implements CloudLicenseBase {
  @PrimaryColumn('uuid')
  cloudLicenseId!: string;

  @Column({ type: 'uuid', unique: true })
  billingOrganizationId!: string;

  @Column({ type: 'uuid', unique: true })
  organizationId!: OrganizationId;

  @Column({ type: 'integer', default: 180 * 60 })
  liveTestingRemainingFreeSeconds!: number;

  @Column({ type: 'integer', default: 1 })
  liveTestingParallelCount!: number;

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
