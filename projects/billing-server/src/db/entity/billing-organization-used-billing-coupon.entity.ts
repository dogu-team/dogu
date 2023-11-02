import { BillingOrganizationUsedBillingCouponBase } from '@dogu-private/console';
import { Entity, PrimaryColumn } from 'typeorm';
import { CreatedAt, DeletedAt, UpdatedAt } from './util/decorators';

@Entity()
export class BillingOrganizationUsedBillingCoupon implements BillingOrganizationUsedBillingCouponBase {
  @PrimaryColumn('uuid')
  billingOrganizationId!: string;

  @PrimaryColumn('uuid')
  billingCouponId!: string;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;
}
