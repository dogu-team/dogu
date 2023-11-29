import { BillingCategory, BillingCurrency, BillingPeriod, BillingPlanInfoBase, BillingPlanInfoProp, BillingPlanState, BillingPlanType } from '@dogu-private/console';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { CreatedAt, DateColumn, DeletedAt, UpdatedAt } from '../decorators';
import { BillingCoupon } from './billing-coupon.entity';
import { BillingOrganization } from './billing-organization.entity';
import { BillingPlanSource } from './billing-plan-source.entity';

@Entity()
export class BillingPlanInfo implements BillingPlanInfoBase {
  @PrimaryColumn('uuid')
  billingPlanInfoId!: string;

  @Column({ type: 'enum', enum: BillingCategory })
  category!: BillingCategory;

  @Column({ type: 'enum', enum: BillingPlanType })
  type!: BillingPlanType;

  @Column({ type: 'integer' })
  option!: number;

  @Column({ type: 'enum', enum: BillingCurrency })
  currency!: BillingCurrency;

  @Column({ type: 'enum', enum: BillingPeriod })
  period!: BillingPeriod;

  @Column({ type: 'double precision' })
  originPrice!: number;

  @Column({ type: 'uuid' })
  billingOrganizationId!: string;

  @Column({ type: 'integer' })
  billingPlanSourceId!: number;

  @Column({ type: 'uuid', nullable: true })
  billingCouponId!: string | null;

  @Column({ type: 'integer', nullable: true })
  couponRemainingApplyCount!: number | null;

  @Column({ type: 'boolean', default: false })
  couponApplied!: boolean;

  @Column({ type: 'double precision' })
  discountedAmount!: number;

  @Column({ type: 'enum', enum: BillingPeriod, nullable: true })
  changeRequestedPeriod!: BillingPeriod | null;

  @Column({ type: 'integer', nullable: true })
  changeRequestedOption!: number | null;

  @Column({ type: 'double precision', nullable: true })
  changeRequestedOriginPrice!: number | null;

  @Column({ type: 'double precision', nullable: true })
  changeRequestedDiscountedAmount!: number | null;

  @Column({ type: 'enum', enum: BillingPlanState })
  state!: BillingPlanState;

  @DateColumn({ nullable: true })
  unsubscribedAt!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  billingPlanHistoryId!: string | null;

  @Column({ type: 'character varying', nullable: true })
  paddlePaymentType!: string | null;

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

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;

  @ManyToOne(() => BillingOrganization, (billingOrganization) => billingOrganization.billingPlanInfos)
  @JoinColumn({ name: BillingPlanInfoProp.billingOrganizationId })
  billingOrganization?: BillingOrganization;

  @ManyToOne(() => BillingCoupon)
  @JoinColumn({ name: BillingPlanInfoProp.billingCouponId })
  billingCoupon?: BillingCoupon;

  @ManyToOne(() => BillingPlanSource)
  @JoinColumn({ name: BillingPlanInfoProp.billingPlanSourceId })
  billingPlanSource?: BillingPlanSource;
}
