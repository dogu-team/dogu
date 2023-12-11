import { BillingCategory, BillingCurrency, BillingMethod, BillingOrganizationBase } from '@dogu-private/console';
import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { CreatedAt, DateColumn, DeletedAt, UpdatedAt } from '../decorators';
import { BillingMethodNice } from './billing-method-nice.entity';
import { BillingMethodPaddle } from './billing-method-paddle.entity';
import { BillingPlanHistory } from './billing-plan-history.entity';
import { BillingPlanInfo } from './billing-plan-info.entity';
import { BillingPlanSource } from './billing-plan-source.entity';

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

  @Column({ type: 'enum', enum: BillingMethod, nullable: true })
  billingMethod!: BillingMethod | null;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;

  @OneToMany(() => BillingPlanInfo, (billingPlanInfo) => billingPlanInfo.billingOrganization)
  billingPlanInfos?: BillingPlanInfo[];

  @OneToMany(() => BillingPlanSource, (billingPlanSource) => billingPlanSource.billingOrganization)
  billingPlanSources?: BillingPlanSource[];

  @OneToMany(() => BillingPlanHistory, (billingPlanHistory) => billingPlanHistory.billingOrganization)
  billingPlanHistories?: BillingPlanHistory[];

  @OneToOne(() => BillingMethodNice, (billingMethodNice) => billingMethodNice.billingOrganization)
  billingMethodNice?: BillingMethodNice;

  @OneToOne(() => BillingMethodPaddle, (billingMethodPaddle) => billingMethodPaddle.billingOrganization)
  billingMethodPaddle?: BillingMethodPaddle;
}
