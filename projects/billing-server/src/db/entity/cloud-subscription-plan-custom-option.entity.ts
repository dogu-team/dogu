import {
  BillingCurrency,
  BillingPeriod,
  CloudSubscriptionPlanCustomOptionBase,
  CloudSubscriptionPlanCustomOptionPropCamel,
  CloudSubscriptionPlanCustomOptionPropSnake,
  CloudSubscriptionPlanType,
} from '@dogu-private/console';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { CloudLicense } from './cloud-license.entity';
import { ColumnTemplate } from './util/decorators';

@Entity('cloud_subscription_plan_custom_option')
export class CloudSubscriptionPlanCustomOption implements CloudSubscriptionPlanCustomOptionBase {
  @PrimaryColumn('uuid', { name: CloudSubscriptionPlanCustomOptionPropSnake.cloud_subscription_plan_custom_option_id })
  cloudSubscriptionPlanCustomOptionId!: string;

  @Column({ type: 'enum', name: CloudSubscriptionPlanCustomOptionPropSnake.type, enum: CloudSubscriptionPlanType, nullable: false })
  type!: CloudSubscriptionPlanType;

  @Column({ type: 'integer', name: CloudSubscriptionPlanCustomOptionPropSnake.option, nullable: false })
  option!: number;

  @Column({ type: 'enum', name: CloudSubscriptionPlanCustomOptionPropSnake.currency, enum: BillingCurrency, nullable: false })
  currency!: BillingCurrency;

  @Column({ type: 'enum', name: CloudSubscriptionPlanCustomOptionPropSnake.period, enum: BillingPeriod, nullable: false })
  period!: BillingPeriod;

  @Column({ type: 'integer', name: CloudSubscriptionPlanCustomOptionPropSnake.price, nullable: false })
  price!: number;

  @Column({ type: 'uuid', name: CloudSubscriptionPlanCustomOptionPropSnake.cloud_license_id })
  cloudLicenseId!: string;

  @ColumnTemplate.CreateDate(CloudSubscriptionPlanCustomOptionPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(CloudSubscriptionPlanCustomOptionPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(CloudSubscriptionPlanCustomOptionPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => CloudLicense, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: CloudSubscriptionPlanCustomOptionPropSnake.cloud_license_id, referencedColumnName: CloudSubscriptionPlanCustomOptionPropCamel.cloudLicenseId })
  cloudLicense?: CloudLicense;
}
