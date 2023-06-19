import { CloudDeviceRentalBase, CloudDeviceRentalPropSnake } from '@dogu-private/console';
import { CloudDeviceRentalId, CLOUD_DEVICE_RENTAL_TABLE_NAME, DeviceId, OrganizationId, UserId } from '@dogu-private/types';
import { BaseEntity, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CloudDevice } from './cloud-device.entity';
import { ColumnTemplate } from './decorators';
import { Organization, User } from './index';

@Entity(CLOUD_DEVICE_RENTAL_TABLE_NAME)
export class CloudDeviceRental extends BaseEntity implements CloudDeviceRentalBase {
  @PrimaryGeneratedColumn('uuid', { name: CloudDeviceRentalPropSnake.cloud_device_rental_id })
  cloudDeviceRentalId!: CloudDeviceRentalId;

  @ColumnTemplate.RelationUuid(CloudDeviceRentalPropSnake.organization_id)
  organizationId!: OrganizationId;

  @ColumnTemplate.RelationUuid(CloudDeviceRentalPropSnake.cloud_device_id)
  cloudDeviceId!: DeviceId;

  @ColumnTemplate.RelationUuid(CloudDeviceRentalPropSnake.customer_id)
  customerId!: UserId;

  @ColumnTemplate.CreateDate(CloudDeviceRentalPropSnake.started_at)
  startedAt!: Date;

  @ColumnTemplate.DeleteDate(CloudDeviceRentalPropSnake.ended_at)
  endedAt!: Date | null;

  @ManyToOne(() => Organization, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: CloudDeviceRentalPropSnake.organization_id })
  organization?: Organization;

  @OneToOne(() => CloudDevice, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: CloudDeviceRentalPropSnake.cloud_device_id })
  cloudDevice?: CloudDevice;

  @ManyToOne(() => User, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: CloudDeviceRentalPropSnake.customer_id })
  customer?: User;
}
