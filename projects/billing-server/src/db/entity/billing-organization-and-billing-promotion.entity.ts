import { BillingOrganizationAndBillingPromotionBase, BillingOrganizationAndBillingPromotionPropSnake } from '@dogu-private/console';
import { Entity, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './util/decorators';

@Entity('billing_organization_and_billing_promotion')
export class BillingOrganizationAndBillingPromotion implements BillingOrganizationAndBillingPromotionBase {
  @PrimaryColumn('uuid', { name: BillingOrganizationAndBillingPromotionPropSnake.billing_organization_id })
  billingOrganizationId!: string;

  @PrimaryColumn('uuid', { name: BillingOrganizationAndBillingPromotionPropSnake.billing_promotion_id })
  billingPromotionId!: string;

  @ColumnTemplate.CreateDate(BillingOrganizationAndBillingPromotionPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(BillingOrganizationAndBillingPromotionPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(BillingOrganizationAndBillingPromotionPropSnake.deleted_at)
  deletedAt!: Date | null;
}
