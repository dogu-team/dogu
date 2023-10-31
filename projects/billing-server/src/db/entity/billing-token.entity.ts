import { BillingTokenBase, BillingTokenPropSnake } from '@dogu-private/console';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './util/decorators';

@Entity('billing_token')
export class BillingToken implements BillingTokenBase {
  @PrimaryColumn('uuid', { name: BillingTokenPropSnake.billing_token_id })
  billingTokenId!: string;

  @Column({ type: 'character varying', name: BillingTokenPropSnake.token, unique: true })
  token!: string;

  @ColumnTemplate.Date(BillingTokenPropSnake.expired_at, true)
  expiredAt!: Date | null;

  @ColumnTemplate.CreateDate(BillingTokenPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(BillingTokenPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(BillingTokenPropSnake.deleted_at)
  deletedAt!: Date | null;
}
