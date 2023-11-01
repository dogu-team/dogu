import { BillingCategory, BillingPromotionBase, BillingPromotionPropSnake, BillingPromotionType } from '@dogu-private/console';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './util/decorators';

@Entity('billing_promotion')
export class BillingPromotion implements BillingPromotionBase {
  @PrimaryColumn('uuid', { name: BillingPromotionPropSnake.billing_promition_id })
  billingPromitionId!: string;

  @Column({ type: 'enum', name: BillingPromotionPropSnake.category, enum: BillingCategory })
  category!: BillingCategory;

  @Column({ type: 'enum', name: BillingPromotionPropSnake.type, enum: BillingPromotionType })
  type!: BillingPromotionType;

  @ColumnTemplate.CreateDate(BillingPromotionPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(BillingPromotionPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(BillingPromotionPropSnake.deleted_at)
  deletedAt!: Date | null;
}
