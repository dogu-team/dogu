import { DeviceRunnerBase, DeviceRunnerPropCamel, DeviceRunnerPropSnake } from '@dogu-private/console';
import { DeviceId, DeviceRunnerId } from '@dogu-private/types';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { RoutineDeviceJob } from './device-job.entity';
import { Device } from './device.entity';
import { RecordDeviceJob } from './record-device-job.entity';
import { RemoteDeviceJob } from './remote-device-job.entity';

export const DeviceRunnerTableName = 'device_runner';

@Entity(DeviceRunnerTableName)
export class DeviceRunner implements DeviceRunnerBase {
  @PrimaryColumn('uuid', { name: DeviceRunnerPropSnake.device_runner_id })
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

  @OneToMany(() => RecordDeviceJob, (recordDeviceJob) => recordDeviceJob.deviceRunner, { cascade: ['soft-remove'] })
  recordDeviceJobs?: RecordDeviceJob[];
}
