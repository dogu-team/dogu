import { BillingCategory, BillingOrganizationBase, BillingOrganizationPropSnake } from '@dogu-private/console';
import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { BillingMethodNice } from './billing-method-nice.entity';
import { BillingSubscriptionPlan } from './billing-subscription-plan.entity';
import { ColumnTemplate } from './util/decorators';

@Entity('billing_organization')
export class BillingOrganization implements BillingOrganizationBase {
  @PrimaryColumn('uuid', { name: BillingOrganizationPropSnake.billing_organization_id })
  billingOrganizationId!: string;

  @Column({ type: 'uuid', name: BillingOrganizationPropSnake.organization_id, unique: true })
  organizationId!: string;

  @Column({ type: 'enum', name: BillingOrganizationPropSnake.category, enum: BillingCategory })
  category!: BillingCategory;

  @ColumnTemplate.Date(BillingOrganizationPropSnake.first_purchased_at, true)
  firstPurchasedAt!: Date | null;

  @ColumnTemplate.CreateDate(BillingOrganizationPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(BillingOrganizationPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(BillingOrganizationPropSnake.deleted_at)
  deletedAt!: Date | null;

  @OneToMany(() => BillingSubscriptionPlan, (billingSubscriptionPlan) => billingSubscriptionPlan.billingOrganization)
  billingSubscriptionPlans?: BillingSubscriptionPlan[];

  @OneToOne(() => BillingMethodNice, (billingMethodNice) => billingMethodNice.billingOrganization)
  billingMethodNice?: BillingMethodNice;
}
