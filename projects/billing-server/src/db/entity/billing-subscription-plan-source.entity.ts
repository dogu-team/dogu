import {
  BillingCategory,
  BillingCurrency,
  BillingPeriod,
  BillingSubscriptionPlanSourceBase,
  BillingSubscriptionPlanSourceProp,
  BillingSubscriptionPlanType,
} from '@dogu-private/console';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { CreatedAt, DeletedAt, UpdatedAt } from '../decorators';
import { BillingOrganization } from './billing-organization.entity';

export const BillingSubscriptionPlanSourceTableName = 'billing_subscription_plan_source';

@Entity(BillingSubscriptionPlanSourceTableName)
export class BillingSubscriptionPlanSource implements BillingSubscriptionPlanSourceBase {
  @PrimaryColumn({ type: 'integer' })
  billingSubscriptionPlanSourceId!: number;

  @Column({ type: 'enum', enum: BillingCategory })
  category!: BillingCategory;

  @Column({ type: 'enum', enum: BillingSubscriptionPlanType })
  type!: BillingSubscriptionPlanType;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'integer' })
  option!: number;

  @Column({ type: 'enum', enum: BillingCurrency })
  currency!: BillingCurrency;

  @Column({ type: 'enum', enum: BillingPeriod })
  period!: BillingPeriod;

  @Column({ type: 'double precision' })
  originPrice!: number;

  @Column({ type: 'uuid', nullable: true })
  billingOrganizationId!: string | null;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;

  @ManyToOne(() => BillingOrganization, (billingOrganization) => billingOrganization.billingSubscriptionPlanSources)
  @JoinColumn({ name: BillingSubscriptionPlanSourceProp.billingOrganizationId })
  billingOrganization?: BillingOrganization;
}
