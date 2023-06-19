import { ProjectAndDeviceBase, ProjectAndDevicePropSnake } from '@dogu-private/console';
import { DeviceId, ProjectId, PROJECT_AND_DEVICE_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from '../decorators';
import { Device } from '../device.entity';
import { Project } from '../project.entity';

@Entity(PROJECT_AND_DEVICE_TABLE_NAME)
export class ProjectAndDevice extends BaseEntity implements ProjectAndDeviceBase {
  @PrimaryColumn({ type: 'uuid', name: ProjectAndDevicePropSnake.device_id, nullable: false })
  deviceId!: DeviceId;

  @PrimaryColumn({ type: 'uuid', name: ProjectAndDevicePropSnake.project_id, nullable: false })
  projectId!: ProjectId;

  @ColumnTemplate.CreateDate(ProjectAndDevicePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.DeleteDate(ProjectAndDevicePropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => Device, (device) => device.projectAndDevices, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: ProjectAndDevicePropSnake.device_id })
  device?: Device;

  @ManyToOne(() => Project, (project) => project.projectAndDevices, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: ProjectAndDevicePropSnake.project_id })
  project?: Project;
}
