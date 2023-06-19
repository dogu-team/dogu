import { DeviceAndDeviceTagBase, DeviceAndDeviceTagPropSnake } from '@dogu-private/console';
import { DeviceId, DeviceTagId, DEVICE_AND_DEVICE_TAG_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from '../decorators';
import { DeviceTag } from '../device-tag.entity';
import { Device } from '../device.entity';

@Entity(DEVICE_AND_DEVICE_TAG_TABLE_NAME)
export class DeviceAndDeviceTag extends BaseEntity implements DeviceAndDeviceTagBase {
  @PrimaryColumn({ type: 'int', name: DeviceAndDeviceTagPropSnake.device_tag_id, unsigned: true, nullable: false })
  deviceTagId!: DeviceTagId;

  @PrimaryColumn({ type: 'uuid', name: DeviceAndDeviceTagPropSnake.device_id, nullable: false })
  deviceId!: DeviceId;

  @ColumnTemplate.CreateDate(DeviceAndDeviceTagPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.DeleteDate(DeviceAndDeviceTagPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => DeviceTag, (tag) => tag.deviceAndDeviceTags, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: DeviceAndDeviceTagPropSnake.device_tag_id })
  deviceTag?: DeviceTag;

  @ManyToOne(() => Device, (device) => device.deviceAndDeviceTags, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: DeviceAndDeviceTagPropSnake.device_id })
  device?: Device;
}
