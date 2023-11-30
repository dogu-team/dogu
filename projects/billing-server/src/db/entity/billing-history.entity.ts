import { BillingCurrency, BillingHistoryBase, BillingHistoryProp, BillingHistoryType, BillingMethod } from '@dogu-private/console';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { CreatedAt, DeletedAt, UpdatedAt } from '../decorators';
import { BillingOrganization } from './billing-organization.entity';
import { BillingPlanHistory } from './billing-plan-history.entity';

@Entity()
export class BillingHistory implements BillingHistoryBase {
  @PrimaryColumn('uuid')
  billingHistoryId!: string;

  @Column({ type: 'uuid' })
  billingOrganizationId!: string;

  @Column({ type: 'jsonb', nullable: true })
  previewResponse!: Record<string, unknown> | null;

  @Column({ type: 'double precision', nullable: true })
  purchasedAmount!: number | null;

  @Column({ type: 'enum', enum: BillingCurrency })
  currency!: BillingCurrency;

  @Column({ type: 'character varying' })
  goodsName!: string;

  @Column({ type: 'enum', enum: BillingMethod })
  method!: BillingMethod;

  @Column({ type: 'jsonb', nullable: true })
  niceSubscribePaymentsResponse!: Record<string, unknown> | null;

  @Column({ type: 'character varying', nullable: true })
  niceTid!: string | null;

  @Column({ type: 'character varying', nullable: true })
  niceOrderId!: string | null;

  @Column({ type: 'character varying', nullable: true })
  cardCode!: string | null;

  @Column({ type: 'character varying', nullable: true })
  cardName!: string | null;

  @Column({ type: 'character varying', nullable: true })
  cardNumberLast4Digits!: string | null;

  @Column({ type: 'character varying', nullable: true })
  cardExpirationYear!: string | null;

  @Column({ type: 'character varying', nullable: true })
  cardExpirationMonth!: string | null;

  @Column({ type: 'character varying', nullable: true })
  paddleMethodType!: string | null;

  @Column({ type: 'character varying', nullable: true })
  paddleTransactionId!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  paddleTransaction!: Record<string, unknown> | null;

  @Column({ type: 'character varying', nullable: true })
  cancelReason!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  nicePaymentsCancelResponse!: Record<string, unknown> | null;

  @Column({ type: 'enum', enum: BillingHistoryType })
  historyType!: BillingHistoryType;

  @Column({ type: 'uuid', nullable: true })
  purchasedBillingHistoryId!: string | null;

  @Column({ type: 'double precision', nullable: true })
  refundedAmount!: number | null;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;

  @ManyToOne(() => BillingOrganization)
  @JoinColumn({ name: BillingHistoryProp.billingOrganizationId })
  billingOrganization?: BillingOrganization;

  @OneToMany(() => BillingPlanHistory, (billingPlanHistory) => billingPlanHistory.billingHistory)
  billingPlanHistories?: BillingPlanHistory[];
}
