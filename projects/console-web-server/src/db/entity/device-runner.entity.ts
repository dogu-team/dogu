import { DeviceRunnerBase, DeviceRunnerPropCamel, DeviceRunnerPropSnake } from '@dogu-private/console';
import { DeviceId, DeviceRunnerId, DEVICE_RUNNER_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { RoutineDeviceJob } from './device-job.entity';
import { Device } from './device.entity';
import { RemoteDeviceJob } from './remote-device-job.entity';

@Entity(DEVICE_RUNNER_TABLE_NAME)
export class DeviceRunner extends BaseEntity implements DeviceRunnerBase {
  @PrimaryGeneratedColumn('uuid', { name: DeviceRunnerPropSnake.device_runner_id })
  deviceRunnerId!: DeviceRunnerId;

  @Column({ type: 'smallint', name: DeviceRunnerPropSnake.is_in_use, unsigned: true, default: 0, nullable: false })
  isInUse!: number;

  @ColumnTemplate.CreateDate(DeviceRunnerPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(DeviceRunnerPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(DeviceRunnerPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ColumnTemplate.RelationUuid(DeviceRunnerPropSnake.device_id)
  deviceId!: DeviceId;

  @ManyToOne(() => Device, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: DeviceRunnerPropSnake.device_id, referencedColumnName: DeviceRunnerPropCamel.deviceId })
  device?: Device;

  @OneToMany(() => RoutineDeviceJob, (routineDeviceJob) => routineDeviceJob.deviceRunner, { cascade: ['soft-remove'] })
  routineDeviceJobs?: RoutineDeviceJob[];

  @OneToMany(() => RemoteDeviceJob, (remoteDeviceJob) => remoteDeviceJob.deviceRunner, { cascade: ['soft-remove'] })
  remoteDeviceJobs?: RemoteDeviceJob[];
}
