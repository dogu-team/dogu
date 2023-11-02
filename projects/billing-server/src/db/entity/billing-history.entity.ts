import { BillingHistoryBase, BillingHistoryProp, BillingSubscriptionPlanProp } from '@dogu-private/console';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryColumn } from 'typeorm';
import { BillingOrganization } from './billing-organization.entity';
import { BillingSubscriptionPlan } from './billing-subscription-plan.entity';
import { CreatedAt, DateColumn, DeletedAt, UpdatedAt } from './util/decorators';

@Entity()
export class BillingHistory implements BillingHistoryBase {
  @PrimaryColumn('uuid')
  billingHistoryId!: string;

  @DateColumn()
  purchasedAt!: Date;

  @Column({ type: 'uuid' })
  billingOrganizationId!: string;

  @Column({ type: 'jsonb', nullable: true })
  subscribePaymentsResponse!: Record<string, unknown> | null;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;

  @ManyToOne(() => BillingOrganization)
  @JoinColumn({ name: BillingHistoryProp.billingOrganizationId })
  billingOrganization?: BillingOrganization;

  @ManyToMany(() => BillingSubscriptionPlan, (billingSubscriptionPlan) => billingSubscriptionPlan.billingHistories)
  @JoinTable({
    name: 'billing_history_and_billing_subscription_plan',
    joinColumn: { name: BillingHistoryProp.billingHistoryId },
    inverseJoinColumn: { name: BillingSubscriptionPlanProp.billingSubscriptionPlanId },
  })
  billingSubscriptionPlans?: BillingSubscriptionPlan[];
}
