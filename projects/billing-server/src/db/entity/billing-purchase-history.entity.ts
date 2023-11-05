import { BillingMethod, BillingPurchaseHistoryBase, BillingPurchaseHistoryProp } from '@dogu-private/console';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { CreatedAt, DateColumn, DeletedAt, UpdatedAt } from '../decorators';
import { BillingOrganization } from './billing-organization.entity';
import { BillingSubscriptionPlanHistory } from './billing-subscription-plan-history.entity';

@Entity()
export class BillingPurchaseHistory implements BillingPurchaseHistoryBase {
  @PrimaryColumn('uuid')
  billingPurchaseHistoryId!: string;

  @Column({ type: 'uuid' })
  billingOrganizationId!: string;

  @DateColumn()
  purchasedAt!: Date;

  @Column({ type: 'enum', enum: BillingMethod })
  method!: BillingMethod;

  @Column({ type: 'jsonb', nullable: true })
  niceSubscribePaymentsResponse!: Record<string, unknown> | null;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;

  @ManyToOne(() => BillingOrganization)
  @JoinColumn({ name: BillingPurchaseHistoryProp.billingOrganizationId })
  billingOrganization?: BillingOrganization;

  @OneToMany(() => BillingSubscriptionPlanHistory, (billingSubscriptionPlanHistory) => billingSubscriptionPlanHistory.billingPurchaseHistory)
  billingSubscriptionPlanHistories?: BillingSubscriptionPlanHistory[];
}
