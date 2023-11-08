import { BillingCurrency, BillingHistoryBase, BillingHistoryProp, BillingMethod } from '@dogu-private/console';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { CreatedAt, DateColumn, DeletedAt, UpdatedAt } from '../decorators';
import { BillingOrganization } from './billing-organization.entity';
import { BillingSubscriptionPlanHistory } from './billing-subscription-plan-history.entity';

@Entity()
export class BillingHistory implements BillingHistoryBase {
  @PrimaryColumn('uuid')
  billingHistoryId!: string;

  @Column({ type: 'uuid' })
  billingOrganizationId!: string;

  @DateColumn()
  purchasedAt!: Date;

  @Column({ type: 'enum', enum: BillingMethod })
  method!: BillingMethod;

  @Column({ type: 'jsonb', nullable: true })
  niceSubscribePaymentsResponse!: Record<string, unknown> | null;

  @Column({ type: 'jsonb' })
  previewResponse!: Record<string, unknown>;

  @Column({ type: 'double precision' })
  totalPrice!: number;

  @Column({ type: 'enum', enum: BillingCurrency })
  currency!: BillingCurrency;

  @Column({ type: 'character varying' })
  goodsName!: string;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;

  @ManyToOne(() => BillingOrganization)
  @JoinColumn({ name: BillingHistoryProp.billingOrganizationId })
  billingOrganization?: BillingOrganization;

  @OneToMany(() => BillingSubscriptionPlanHistory, (billingSubscriptionPlanHistory) => billingSubscriptionPlanHistory.billingHistory)
  billingSubscriptionPlanHistories?: BillingSubscriptionPlanHistory[];
}
