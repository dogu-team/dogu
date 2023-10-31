import { BillingHistoryBase, BillingHistoryPropSnake } from '@dogu-private/console';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './util/decorators';

@Entity('billing_history')
export class BillingHostiry implements BillingHistoryBase {
  @PrimaryColumn('uuid', { name: BillingHistoryPropSnake.billing_history_id })
  billingHistoryId!: string;

  @Column({ type: 'character varying', name: BillingHistoryPropSnake.message })
  message!: string;

  @ColumnTemplate.CreateDate(BillingHistoryPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(BillingHistoryPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(BillingHistoryPropSnake.deleted_at)
  deletedAt!: Date | null;
}
