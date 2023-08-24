import { DeviceBrowserBase, DeviceBrowserPropCamel, DeviceBrowserPropSnake } from '@dogu-private/console';
import {
  BrowserName,
  DeviceBrowserId,
  DeviceId,
  DEVICE_BROWSER_BROWSER_NAME_MAX_LENGTH,
  DEVICE_BROWSER_BROWSER_VERSION_MAX_LENGTH,
  DEVICE_BROWSER_TABLE_NAME,
} from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Device } from './device.entity';

@Entity(DEVICE_BROWSER_TABLE_NAME)
export class DeviceBrowser extends BaseEntity implements DeviceBrowserBase {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: `${DeviceBrowserPropSnake.device_browser_id}`, unsigned: true })
  deviceBrowserId!: DeviceBrowserId;

  @Column({ type: 'character varying', name: DeviceBrowserPropSnake.browser_name, length: DEVICE_BROWSER_BROWSER_NAME_MAX_LENGTH, nullable: false })
  browserName!: BrowserName;

  @Column({ type: 'character varying', name: DeviceBrowserPropSnake.browser_version, length: DEVICE_BROWSER_BROWSER_VERSION_MAX_LENGTH, default: '', nullable: false })
  browserVersion!: string;

  @Column({ type: 'smallint', name: DeviceBrowserPropSnake.is_installed, unsigned: true, default: 0, nullable: false })
  isInstalled!: number;

  @ColumnTemplate.CreateDate(DeviceBrowserPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(DeviceBrowserPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(DeviceBrowserPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ColumnTemplate.RelationUuid(DeviceBrowserPropSnake.device_id)
  deviceId!: DeviceId;

  @ManyToOne(() => Device, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: DeviceBrowserPropSnake.device_id, referencedColumnName: DeviceBrowserPropCamel.deviceId })
  device?: Device;
}
