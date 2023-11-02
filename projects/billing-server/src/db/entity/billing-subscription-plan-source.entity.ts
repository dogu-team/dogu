import { BillingCategory, BillingCurrency, BillingPeriod, BillingSubscriptionPlanSourceBase, BillingSubscriptionPlanType } from '@dogu-private/console';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { CreatedAt, DeletedAt, UpdatedAt } from './util/decorators';

@Entity()
export class BillingSubscriptionPlanSource implements BillingSubscriptionPlanSourceBase {
  @PrimaryColumn('uuid')
  billingSubscriptionPlanSourceId!: string;

  @Column({ type: 'enum', enum: BillingCategory })
  category!: BillingCategory;

  @Column({ type: 'enum', enum: BillingSubscriptionPlanType })
  type!: BillingSubscriptionPlanType;

  @Column({ type: 'integer' })
  option!: number;

  @Column({ type: 'enum', enum: BillingCurrency })
  currency!: BillingCurrency;

  @Column({ type: 'enum', enum: BillingPeriod })
  period!: BillingPeriod;

  @Column({ type: 'integer' })
  price!: number;

  @Column({ type: 'uuid' })
  billingOrganizationId!: string;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;
}
