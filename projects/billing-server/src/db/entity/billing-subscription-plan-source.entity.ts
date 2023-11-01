import {
  BillingCategory,
  BillingCurrency,
  BillingPeriod,
  BillingSubscriptionPlanSourceBase,
  BillingSubscriptionPlanSourcePropSnake,
  BillingSubscriptionPlanType,
} from '@dogu-private/console';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './util/decorators';

@Entity('billing_subscription_plan_source')
export class BillingSubscriptionPlanSource implements BillingSubscriptionPlanSourceBase {
  @PrimaryColumn('uuid', { name: BillingSubscriptionPlanSourcePropSnake.billing_subscription_plan_source_id })
  billingSubscriptionPlanSourceId!: string;

  @Column({ type: 'enum', name: BillingSubscriptionPlanSourcePropSnake.category, enum: BillingCategory })
  category!: BillingCategory;

  @Column({ type: 'enum', name: BillingSubscriptionPlanSourcePropSnake.type, enum: BillingSubscriptionPlanType })
  type!: BillingSubscriptionPlanType;

  @Column({ type: 'integer', name: BillingSubscriptionPlanSourcePropSnake.option })
  option!: number;

  @Column({ type: 'enum', name: BillingSubscriptionPlanSourcePropSnake.currency, enum: BillingCurrency })
  currency!: BillingCurrency;

  @Column({ type: 'enum', name: BillingSubscriptionPlanSourcePropSnake.period, enum: BillingPeriod })
  period!: BillingPeriod;

  @Column({ type: 'integer', name: BillingSubscriptionPlanSourcePropSnake.price })
  price!: number;

  @Column({ type: 'uuid', name: BillingSubscriptionPlanSourcePropSnake.billing_organization_id })
  billingOrganizationId!: string;

  @ColumnTemplate.CreateDate(BillingSubscriptionPlanSourcePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(BillingSubscriptionPlanSourcePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(BillingSubscriptionPlanSourcePropSnake.deleted_at)
  deletedAt!: Date | null;
}
