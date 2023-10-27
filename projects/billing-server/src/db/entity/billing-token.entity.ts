import { BillingTokenBase, BillingTokenPropSnake } from '@dogu-private/console';
import { Entity, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './util/decorators';

@Entity('billing_token')
export class BillingToken implements BillingTokenBase {
  @PrimaryColumn('uuid', { name: BillingTokenPropSnake.billing_token_id })
  billingTokenId!: string;

  @PrimaryColumn({ type: 'character varying', name: BillingTokenPropSnake.token })
  token!: string;

  @ColumnTemplate.CreateDate(BillingTokenPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.Date(BillingTokenPropSnake.expired_at, true)
  expiredAt!: Date | null;

  @ColumnTemplate.DeleteDate(BillingTokenPropSnake.deleted_at)
  deletedAt!: Date | null;
}
