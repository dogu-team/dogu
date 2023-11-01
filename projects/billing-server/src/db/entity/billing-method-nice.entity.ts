import { BillingInfoPropCamel, BillingMethodNiceBase, BillingMethodNicePropSnake } from '@dogu-private/console';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { BillingInfo } from './billing-info.entity';
import { ColumnTemplate } from './util/decorators';

@Entity('billing_method_nice')
export class BillingMethodNice implements BillingMethodNiceBase {
  @PrimaryColumn('uuid', { name: BillingMethodNicePropSnake.billing_method_nice_id })
  billingMethodNiceId!: string;

  @Column({ type: 'uuid', name: BillingMethodNicePropSnake.billing_info_id, unique: true })
  billingInfoId!: string;

  @Column({ type: 'character varying', name: BillingMethodNicePropSnake.bid, nullable: true })
  bid!: string | null;

  @Column({ type: 'character varying', name: BillingMethodNicePropSnake.card_code, nullable: true })
  cardCode!: string | null;

  @Column({ type: 'character varying', name: BillingMethodNicePropSnake.card_name, nullable: true })
  cardName!: string | null;

  @Column({ type: 'character varying', name: BillingMethodNicePropSnake.card_no_last_4, nullable: true })
  cardNoLast4!: string | null;

  @Column({ type: 'jsonb', name: BillingMethodNicePropSnake.subscribe_regist_response, nullable: true })
  subscribeRegistResponse!: Record<string, unknown> | null;

  @ColumnTemplate.CreateDate(BillingMethodNicePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(BillingMethodNicePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(BillingMethodNicePropSnake.deleted_at)
  deletedAt!: Date | null;

  @OneToOne(() => BillingInfo, (billingInfo) => billingInfo.billingMethodNice)
  @JoinColumn({ name: BillingMethodNicePropSnake.billing_info_id, referencedColumnName: BillingInfoPropCamel.billingInfoId })
  billingInfo?: BillingInfo;
}
