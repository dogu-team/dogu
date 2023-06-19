import { CloudDeviceBase, CloudDevicePropSnake } from '@dogu-private/console';
import { CloudDeviceId, CLOUD_DEVICE_TABLE_NAME, DeviceId } from '@dogu-private/types';
import { BaseEntity, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CloudDeviceRental } from './cloud-device-rental.entity';
import { ColumnTemplate } from './decorators';
import { Device } from './index';

@Entity(CLOUD_DEVICE_TABLE_NAME)
export class CloudDevice extends BaseEntity implements CloudDeviceBase {
  @PrimaryGeneratedColumn('uuid', { name: CloudDevicePropSnake.cloud_device_id })
  cloudDeviceId!: CloudDeviceId;

  @ColumnTemplate.RelationUuid(CloudDevicePropSnake.device_id)
  deviceId!: DeviceId;

  @ColumnTemplate.CreateDate(CloudDevicePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.DeleteDate(CloudDevicePropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => Device, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: CloudDevicePropSnake.device_id })
  device?: Device;

  @OneToOne(() => CloudDeviceRental, (cloudDeviceRental) => cloudDeviceRental.cloudDevice)
  cloudDeviceRental?: CloudDeviceRental;
}
