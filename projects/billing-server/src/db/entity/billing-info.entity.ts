import { BillingCategory, BillingInfoBase, BillingInfoPropSnake } from '@dogu-private/console';
import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { BillingMethodNice } from './billing-method-nice.entity';
import { BillingSubscriptionPlan } from './billing-subscription-plan.entity';
import { ColumnTemplate } from './util/decorators';

@Entity('billing_info')
export class BillingInfo implements BillingInfoBase {
  @PrimaryColumn('uuid', { name: BillingInfoPropSnake.billing_info_id })
  billingInfoId!: string;

  @Column({ type: 'uuid', name: BillingInfoPropSnake.organization_id, unique: true })
  organizationId!: string;

  @Column({ type: 'enum', name: BillingInfoPropSnake.category, enum: BillingCategory })
  category!: BillingCategory;

  @ColumnTemplate.Date(BillingInfoPropSnake.first_purchased_at, true)
  firstPurchasedAt!: Date | null;

  @ColumnTemplate.CreateDate(BillingInfoPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(BillingInfoPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(BillingInfoPropSnake.deleted_at)
  deletedAt!: Date | null;

  @OneToMany(() => BillingSubscriptionPlan, (billingSubscriptionPlan) => billingSubscriptionPlan.billingInfo)
  billingSubscriptionPlans?: BillingSubscriptionPlan[];

  @OneToOne(() => BillingMethodNice, (billingMethodNice) => billingMethodNice.billingInfo)
  billingMethodNice?: BillingMethodNice;
}
