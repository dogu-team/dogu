import { BillingHistoryAndBillingSubscriptionPlanBase, BillingHistoryAndBillingSubscriptionPlanPropSnake } from '@dogu-private/console';
import { Entity, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './util/decorators';

export const BillingHistoryAndBillingSubscriptionPlanTableName = 'billing_history_and_billing_subscription_plan';

@Entity(BillingHistoryAndBillingSubscriptionPlanTableName)
export class BillingHistoryAndBillingSubscriptionPlan implements BillingHistoryAndBillingSubscriptionPlanBase {
  @PrimaryColumn('uuid', { name: BillingHistoryAndBillingSubscriptionPlanPropSnake.billing_history_id })
  billingHistoryId!: string;

  @PrimaryColumn('uuid', { name: BillingHistoryAndBillingSubscriptionPlanPropSnake.billing_subscription_plan_id })
  billingSubscriptionPlanId!: string;

  @ColumnTemplate.CreateDate(BillingHistoryAndBillingSubscriptionPlanPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(BillingHistoryAndBillingSubscriptionPlanPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(BillingHistoryAndBillingSubscriptionPlanPropSnake.deleted_at)
  deletedAt!: Date | null;
}
