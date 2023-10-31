import { BillingPromotionBase, BillingPromotionPropSnake } from '@dogu-private/console';
import { Entity, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './util/decorators';

@Entity('billing_promotion')
export class BillingPromotion implements BillingPromotionBase {
  @PrimaryColumn('uuid', { name: BillingPromotionPropSnake.billing_promition_id })
  billingPromitionId!: string;

  @ColumnTemplate.CreateDate(BillingPromotionPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(BillingPromotionPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(BillingPromotionPropSnake.deleted_at)
  deletedAt!: Date | null;
}
