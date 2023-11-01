import { BillingInfoAndBillingPromotionBase, BillingInfoAndBillingPromotionPropSnake } from '@dogu-private/console';
import { Entity, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './util/decorators';

@Entity('billing_info_and_billing_promotion')
export class BillingInfoAndBillingPromotion implements BillingInfoAndBillingPromotionBase {
  @PrimaryColumn('uuid', { name: BillingInfoAndBillingPromotionPropSnake.billing_info_id })
  billingInfoId!: string;

  @PrimaryColumn('uuid', { name: BillingInfoAndBillingPromotionPropSnake.billing_promotion_id })
  billingPromotionId!: string;

  @ColumnTemplate.CreateDate(BillingInfoAndBillingPromotionPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(BillingInfoAndBillingPromotionPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(BillingInfoAndBillingPromotionPropSnake.deleted_at)
  deletedAt!: Date | null;
}
