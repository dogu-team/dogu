import { CloudSubscriptionPlanPropCamel, CloudSubscriptionPlanPropSnake, CloudSubscriptionPlanType } from '@dogu-private/console';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { CloudLicense } from './cloud-license.entity';
import { ColumnTemplate } from './util/decorators';

@Entity('cloud_subscription_plan')
export class CloudSubscriptionPlan {
  @PrimaryColumn('uuid', { name: CloudSubscriptionPlanPropSnake.cloud_subscription_plan_id })
  cloudSubscriptionPlanId!: string;

  @Column({ type: 'enum', name: CloudSubscriptionPlanPropSnake.type, enum: CloudSubscriptionPlanType, nullable: false })
  type!: CloudSubscriptionPlanType;

  @Column('uuid', { name: CloudSubscriptionPlanPropSnake.cloud_license_id })
  cloudLicenseId!: string;

  @ColumnTemplate.CreateDate(CloudSubscriptionPlanPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(CloudSubscriptionPlanPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(CloudSubscriptionPlanPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => CloudLicense, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: CloudSubscriptionPlanPropSnake.cloud_license_id, referencedColumnName: CloudSubscriptionPlanPropCamel.cloudLicenseId })
  cloudLicense?: CloudLicense;
}
