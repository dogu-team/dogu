import { BillingCategory, BillingCurrency, BillingOrganizationBase } from '@dogu-private/console';
import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { CreatedAt, DateColumn, DeletedAt, UpdatedAt } from '../decorators';
import { BillingMethodNice } from './billing-method-nice.entity';
import { BillingSubscriptionPlanInfo } from './billing-subscription-plan-info.entity';

@Entity()
export class BillingOrganization implements BillingOrganizationBase {
  @PrimaryColumn('uuid')
  billingOrganizationId!: string;

  @Column({ type: 'uuid', unique: true })
  organizationId!: string;

  @Column({ type: 'enum', enum: BillingCategory })
  category!: BillingCategory;

  @Column({ type: 'enum', enum: BillingCurrency, nullable: true })
  currency!: BillingCurrency | null;

  @Column({ type: 'character varying', nullable: true })
  timezoneOffset!: string | null;

  @DateColumn({ nullable: true })
  yearlyCalculationStartedAt!: Date | null;

  @DateColumn({ nullable: true })
  yearlyCalculationExpiredAt!: Date | null;

  @DateColumn({ nullable: true })
  monthlyCalculationStartedAt!: Date | null;

  @DateColumn({ nullable: true })
  monthlyCalculationExpiredAt!: Date | null;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;

  @OneToMany(() => BillingSubscriptionPlanInfo, (billingSubscriptionPlanInfo) => billingSubscriptionPlanInfo.billingOrganization)
  billingSubscriptionPlanInfos?: BillingSubscriptionPlanInfo[];

  @OneToOne(() => BillingMethodNice, (billingMethodNice) => billingMethodNice.billingOrganization)
  billingMethodNice?: BillingMethodNice;
}
