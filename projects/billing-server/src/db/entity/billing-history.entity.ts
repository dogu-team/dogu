import {
  BillingHistoryAndBillingSubscriptionPlanPropCamel,
  BillingHistoryAndBillingSubscriptionPlanPropSnake,
  BillingHistoryBase,
  BillingHistoryPropCamel,
  BillingHistoryPropSnake,
} from '@dogu-private/console';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryColumn } from 'typeorm';
import { BillingHistoryAndBillingSubscriptionPlanTableName } from './billing-history-and-billing-subscription-plan.entity';
import { BillingOrganization } from './billing-organization.entity';
import { BillingSubscriptionPlan } from './billing-subscription-plan.entity';
import { ColumnTemplate } from './util/decorators';

@Entity('billing_history')
export class BillingHistory implements BillingHistoryBase {
  @PrimaryColumn('uuid', { name: BillingHistoryPropSnake.billing_history_id })
  billingHistoryId!: string;

  @ColumnTemplate.Date(BillingHistoryPropSnake.purchased_at, false)
  purchasedAt!: Date;

  @Column({ type: 'uuid', name: BillingHistoryPropSnake.billing_organization_id })
  billingOrganizationId!: string;

  @ColumnTemplate.CreateDate(BillingHistoryPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(BillingHistoryPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(BillingHistoryPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => BillingOrganization)
  @JoinColumn({ name: BillingHistoryPropSnake.billing_organization_id, referencedColumnName: BillingHistoryPropCamel.billingOrganizationId })
  billingOrganization?: BillingOrganization;

  @ManyToMany(() => BillingSubscriptionPlan)
  @JoinTable({
    name: BillingHistoryAndBillingSubscriptionPlanTableName,
    joinColumn: {
      name: BillingHistoryAndBillingSubscriptionPlanPropSnake.billing_history_id,
      referencedColumnName: BillingHistoryAndBillingSubscriptionPlanPropCamel.billingHistoryId,
    },
    inverseJoinColumn: {
      name: BillingHistoryAndBillingSubscriptionPlanPropSnake.billing_subscription_plan_id,
      referencedColumnName: BillingHistoryAndBillingSubscriptionPlanPropCamel.billingSubscriptionPlanId,
    },
  })
  billingSubscriptionPlans?: BillingSubscriptionPlan[];
}
