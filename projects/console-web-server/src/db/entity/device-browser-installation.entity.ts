import { DeviceBrowserInstallationBase, DeviceBrowserInstallationPropCamel, DeviceBrowserInstallationPropSnake } from '@dogu-private/console';
import {
  BrowserName,
  DeviceBrowserInstallationId,
  DeviceId,
  DEVICE_BROWSER_INSTALLATION_BROWSER_NAME_MAX_LENGTH,
  DEVICE_BROWSER_INSTALLATION_BROWSER_VERSION_MAX_LENGTH,
  DEVICE_BROWSER_INSTALLATION_TABLE_NAME,
} from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Device } from './device.entity';

@Entity(DEVICE_BROWSER_INSTALLATION_TABLE_NAME)
export class DeviceBrowserInstallation extends BaseEntity implements DeviceBrowserInstallationBase {
  @PrimaryGeneratedColumn('uuid', { name: DeviceBrowserInstallationPropSnake.device_browser_installation_id })
  deviceBrowserInstallationId!: DeviceBrowserInstallationId;

  @Column({ type: 'character varying', name: DeviceBrowserInstallationPropSnake.browser_name, length: DEVICE_BROWSER_INSTALLATION_BROWSER_NAME_MAX_LENGTH, nullable: false })
  browserName!: BrowserName;

  @Column({
    type: 'character varying',
    name: DeviceBrowserInstallationPropSnake.browser_version,
    length: DEVICE_BROWSER_INSTALLATION_BROWSER_VERSION_MAX_LENGTH,
    default: '',
    nullable: false,
  })
  browserVersion!: string;

  @ColumnTemplate.CreateDate(DeviceBrowserInstallationPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(DeviceBrowserInstallationPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(DeviceBrowserInstallationPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ColumnTemplate.RelationUuid(DeviceBrowserInstallationPropSnake.device_id)
  deviceId!: DeviceId;

  @ManyToOne(() => Device, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: DeviceBrowserInstallationPropSnake.device_id, referencedColumnName: DeviceBrowserInstallationPropCamel.deviceId })
  device?: Device;
}
