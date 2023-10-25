import { CloudSubscriptionItemPropSnake, CloudSubscriptionItemType } from '@dogu-private/console/src/base/cloud-subscription-item';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { CloudLicense } from './cloud-license.entity';
import { ColumnTemplate } from './util/decorators';

@Entity('cloud_subscription_item')
export class CloudSubscriptionItem {
  @PrimaryColumn('uuid', { name: CloudSubscriptionItemPropSnake.cloud_subscription_item_id })
  cloudSubscriptionItemId!: string;

  @Column({ type: 'enum', name: CloudSubscriptionItemPropSnake.type, enum: CloudSubscriptionItemType, nullable: false })
  type!: CloudSubscriptionItemType;

  @ColumnTemplate.RelationUuid(CloudSubscriptionItemPropSnake.cloud_license_id)
  cloudLicenseId!: string;

  @ColumnTemplate.CreateDate(CloudSubscriptionItemPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(CloudSubscriptionItemPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(CloudSubscriptionItemPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => CloudLicense, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: CloudSubscriptionItemPropSnake.cloud_license_id })
  cloudLicense?: CloudLicense;
}
