import { BillingCategory, BillingOrganizationBase } from '@dogu-private/console';
import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { BillingMethodNice } from './billing-method-nice.entity';
import { BillingSubscriptionPlan } from './billing-subscription-plan.entity';
import { CreatedAt, DateColumn, DeletedAt, UpdatedAt } from './util/decorators';

@Entity()
export class BillingOrganization implements BillingOrganizationBase {
  @PrimaryColumn('uuid')
  billingOrganizationId!: string;

  @Column({ type: 'uuid', unique: true })
  organizationId!: string;

  @Column({ type: 'enum', enum: BillingCategory })
  category!: BillingCategory;

  @DateColumn({ nullable: true })
  firstPurchasedAt!: Date | null;

  @DateColumn({ nullable: true })
  lastMonthlyPurchasedAt!: Date | null;

  @DateColumn({ nullable: true })
  lastYearlyPurchasedAt!: Date | null;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;

  @OneToMany(() => BillingSubscriptionPlan, (billingSubscriptionPlan) => billingSubscriptionPlan.billingOrganization)
  billingSubscriptionPlans?: BillingSubscriptionPlan[];

  @OneToOne(() => BillingMethodNice, (billingMethodNice) => billingMethodNice.billingOrganization)
  billingMethodNice?: BillingMethodNice;
}
