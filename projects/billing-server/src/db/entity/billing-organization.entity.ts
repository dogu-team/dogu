import { BillingCategory, BillingCurrency, BillingOrganizationBase } from '@dogu-private/console';
import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { CreatedAt, DateColumn, DeletedAt, UpdatedAt } from '../decorators';
import { BillingMethodNice } from './billing-method-nice.entity';
import { BillingSubscriptionPlanHistory } from './billing-subscription-plan-history.entity';
import { BillingSubscriptionPlanInfo } from './billing-subscription-plan-info.entity';
import { BillingSubscriptionPlanSource } from './billing-subscription-plan-source.entity';

export const BillingOrganizationTableName = 'billing_organization';

@Entity(BillingOrganizationTableName)
export class BillingOrganization implements BillingOrganizationBase {
  @PrimaryColumn('uuid')
  billingOrganizationId!: string;

  @Column({ type: 'uuid', unique: true })
  organizationId!: string;

  @Column({ type: 'enum', enum: BillingCategory })
  category!: BillingCategory;

  @Column({ type: 'enum', enum: BillingCurrency, nullable: true })
  currency!: BillingCurrency | null;

  @DateColumn({ nullable: true })
  subscriptionYearlyStartedAt!: Date | null;

  @DateColumn({ nullable: true })
  subscriptionYearlyExpiredAt!: Date | null;

  @DateColumn({ nullable: true })
  subscriptionMonthlyStartedAt!: Date | null;

  @DateColumn({ nullable: true })
  subscriptionMonthlyExpiredAt!: Date | null;

  @DateColumn({ nullable: true })
  graceExpiredAt!: Date | null;

  @DateColumn({ nullable: true })
  graceNextPurchasedAt!: Date | null;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;

  @OneToMany(() => BillingSubscriptionPlanInfo, (billingSubscriptionPlanInfo) => billingSubscriptionPlanInfo.billingOrganization)
  billingSubscriptionPlanInfos?: BillingSubscriptionPlanInfo[];

  @OneToMany(() => BillingSubscriptionPlanSource, (billingSubscriptionPlanSource) => billingSubscriptionPlanSource.billingOrganization)
  billingSubscriptionPlanSources?: BillingSubscriptionPlanSource[];

  @OneToMany(() => BillingSubscriptionPlanHistory, (billingSubscriptionPlanHistory) => billingSubscriptionPlanHistory.billingOrganization)
  billingSubscriptionPlanHistories?: BillingSubscriptionPlanHistory[];

  @OneToOne(() => BillingMethodNice, (billingMethodNice) => billingMethodNice.billingOrganization)
  billingMethodNice?: BillingMethodNice;
}
