import { DeviceAndDeviceTagPropCamel, DeviceAndDeviceTagPropSnake, DeviceBase, DevicePropSnake, ProjectAndDevicePropCamel, ProjectAndDevicePropSnake } from '@dogu-private/console';
import {
  DeviceConnectionState,
  DeviceId,
  DEVICE_AND_DEVICE_TAG_TABLE_NAME,
  DEVICE_MANUFACTURER_MAX_LENGTH,
  DEVICE_MODEL_MAX_LENGTH,
  DEVICE_MODEL_NAME_MAX_LENGH,
  DEVICE_NAME_MAX_LENGTH,
  DEVICE_SERIAL_MIN_LENGTH,
  DEVICE_TABLE_NAME,
  DEVICE_VERSION_MAX_LENGTH,
  HostId,
  OrganizationId,
  Platform,
  PROJECT_AND_DEVICE_TABLE_NAME,
} from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { RoutineDeviceJob } from './device-job.entity';
import { DeviceTag } from './device-tag.entity';
import { Host } from './host.entity';
import { DeviceAndDeviceTag, Organization, ProjectAndDevice } from './index';
import { Project } from './project.entity';
import { RemoteDeviceJob } from './remote-device-job.entity';

@Entity(DEVICE_TABLE_NAME)
export class Device extends BaseEntity implements DeviceBase {
  @PrimaryGeneratedColumn('uuid', { name: DevicePropSnake.device_id })
  deviceId!: DeviceId;

  @Column({ type: 'character varying', name: DevicePropSnake.serial, length: DEVICE_SERIAL_MIN_LENGTH, default: '', nullable: false })
  serial!: string;

  @Column({ type: 'character varying', name: DevicePropSnake.serial_unique, length: DEVICE_SERIAL_MIN_LENGTH, default: '', nullable: false })
  serialUnique!: string;

  @Column({ type: 'character varying', name: DevicePropSnake.name, length: DEVICE_NAME_MAX_LENGTH, default: '', nullable: false })
  name!: string;

  @Column({ type: 'smallint', name: DevicePropSnake.platform, unsigned: true, default: Platform.PLATFORM_UNSPECIFIED, nullable: false })
  platform!: Platform;

  @Column({ type: 'character varying', name: DevicePropSnake.model, length: DEVICE_MODEL_MAX_LENGTH, default: '', nullable: false })
  model!: string;

  @Column({ type: 'character varying', name: DevicePropSnake.model_name, length: DEVICE_MODEL_NAME_MAX_LENGH, nullable: true })
  modelName!: string | null;

  @Column({ type: 'character varying', name: DevicePropSnake.version, length: DEVICE_VERSION_MAX_LENGTH, default: '', nullable: false })
  version!: string;

  @Column({ type: 'character varying', name: DevicePropSnake.manufacturer, length: DEVICE_MANUFACTURER_MAX_LENGTH, default: '', nullable: false })
  manufacturer!: string;

  @Column({ type: 'int', name: DevicePropSnake.resolution_width, unsigned: true, default: 0, nullable: false })
  resolutionWidth!: number;

  @Column({ type: 'int', name: DevicePropSnake.resolution_height, unsigned: true, default: 0, nullable: false })
  resolutionHeight!: number;

  @Column({ type: 'smallint', name: DevicePropSnake.is_global, unsigned: true, default: 0, nullable: false })
  isGlobal!: number;

  @Column({ type: 'smallint', name: DevicePropSnake.is_host, unsigned: true, default: 0, nullable: false })
  isHost!: number;

  @Column({ type: 'smallint', name: DevicePropSnake.is_virtual, unsigned: true, default: 0, nullable: false })
  isVirtual!: number;

  @Column({ type: 'smallint', name: DevicePropSnake.enable_host_device, unsigned: true, default: 0, nullable: false })
  enableHostDevice!: number;

  @Column({ type: 'smallint', name: DevicePropSnake.connection_state, unsigned: true, default: DeviceConnectionState.DEVICE_CONNECTION_STATE_DISCONNECTED, nullable: false })
  connectionState!: DeviceConnectionState;

  @Column({ type: 'smallint', name: DevicePropSnake.max_parallel_jobs, unsigned: true, default: 1, nullable: false })
  maxParallelJobs!: number;

  @ColumnTemplate.Date(DevicePropSnake.heartbeat, true)
  heartbeat!: Date | null;

  @ColumnTemplate.RelationUuid(DevicePropSnake.organization_id)
  organizationId!: OrganizationId;

  @ColumnTemplate.RelationUuid(DevicePropSnake.host_id)
  hostId!: HostId;

  @ColumnTemplate.CreateDate(DevicePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(DevicePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(DevicePropSnake.deleted_at)
  deletedAt!: Date | null;

  @OneToMany(() => RoutineDeviceJob, (deviceJob) => deviceJob.device, { createForeignKeyConstraints: false })
  routineDeviceJobs?: RoutineDeviceJob[];

  @OneToMany(() => RemoteDeviceJob, (remotedeviceJob) => remotedeviceJob.device, { createForeignKeyConstraints: false })
  remoteDeviceJobs?: RemoteDeviceJob[];

  @ManyToOne(() => Host, (host) => host.devices, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: DevicePropSnake.host_id })
  host?: Host;

  @ManyToOne(() => Organization, (organization) => organization.devices, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: DevicePropSnake.organization_id })
  organization!: Organization;

  @ManyToMany(() => Project, (project) => project.devices, { createForeignKeyConstraints: false })
  @JoinTable({
    name: PROJECT_AND_DEVICE_TABLE_NAME,
    joinColumn: {
      name: ProjectAndDevicePropSnake.device_id,
      referencedColumnName: ProjectAndDevicePropCamel.deviceId,
    },
    inverseJoinColumn: {
      name: ProjectAndDevicePropSnake.project_id,
      referencedColumnName: ProjectAndDevicePropCamel.projectId,
    },
  })
  projects?: Project[];

  @OneToMany(() => ProjectAndDevice, (deviceAndProject) => deviceAndProject.device, { cascade: ['soft-remove'] })
  projectAndDevices?: ProjectAndDevice[];

  @OneToMany(() => DeviceAndDeviceTag, (tagAndDevice) => tagAndDevice.device, { cascade: ['soft-remove'] })
  deviceAndDeviceTags?: DeviceAndDeviceTag[];

  @ManyToMany(() => DeviceTag, (tag) => tag.devices, { createForeignKeyConstraints: false })
  @JoinTable({
    name: DEVICE_AND_DEVICE_TAG_TABLE_NAME,
    joinColumn: {
      name: DeviceAndDeviceTagPropSnake.device_id,
      referencedColumnName: DeviceAndDeviceTagPropCamel.deviceId,
    },
    inverseJoinColumn: {
      name: DeviceAndDeviceTagPropSnake.device_tag_id,
      referencedColumnName: DeviceAndDeviceTagPropCamel.deviceTagId,
    },
  })
  deviceTags?: DeviceTag[];
}
