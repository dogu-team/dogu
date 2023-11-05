import {
  BillingCategory,
  BillingCurrency,
  BillingPeriod,
  BillingSubscriptionPlanHistoryBase,
  BillingSubscriptionPlanHistoryProp,
  BillingSubscriptionPlanType,
} from '@dogu-private/console';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { CreatedAt, DeletedAt, UpdatedAt } from '../decorators';
import { BillingPurchaseHistory } from './billing-purchase-history.entity';

@Entity()
export class BillingSubscriptionPlanHistory implements BillingSubscriptionPlanHistoryBase {
  @PrimaryColumn('uuid')
  billingSubscriptionPlanHistoryId!: string;

  @Column({ type: 'uuid' })
  billingOrganizationId!: string;

  @Column({ type: 'uuid' })
  billingPurchaseHistoryId!: string;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;

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

  @Column({ type: 'double precision' })
  originPrice!: number;

  @ManyToOne(() => BillingPurchaseHistory, (billingPurchaseHistory) => billingPurchaseHistory.billingSubscriptionPlanHistories)
  @JoinColumn({ name: BillingSubscriptionPlanHistoryProp.billingPurchaseHistoryId })
  billingPurchaseHistory?: BillingPurchaseHistory;
}
