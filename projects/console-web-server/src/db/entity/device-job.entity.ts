import { RoutineDeviceJobBase, RoutineDeviceJobPropSnake } from '@dogu-private/console';
import { DeviceId, PIPELINE_STATUS, RoutineDeviceJobId, RoutineJobId, ROUTINE_DEVICE_JOB_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Device, RoutineJob } from './index';
import { RoutineStep } from './step.entity';

@Entity(ROUTINE_DEVICE_JOB_TABLE_NAME)
export class RoutineDeviceJob extends BaseEntity implements RoutineDeviceJobBase {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: RoutineDeviceJobPropSnake.routine_device_job_id, unsigned: true })
  routineDeviceJobId!: RoutineDeviceJobId;

  @Column({ type: 'int', name: RoutineDeviceJobPropSnake.routine_job_id, unsigned: true, nullable: false })
  routineJobId!: RoutineJobId;

  @ColumnTemplate.RelationUuid(RoutineDeviceJobPropSnake.device_id)
  deviceId!: DeviceId;

  @Column({ type: 'smallint', name: RoutineDeviceJobPropSnake.status, unsigned: true, default: PIPELINE_STATUS.UNSPECIFIED, nullable: false })
  status!: PIPELINE_STATUS;

  @Column({ type: 'smallint', name: RoutineDeviceJobPropSnake.record, unsigned: true, default: 0, nullable: false })
  record!: number;

  @ColumnTemplate.Date(RoutineDeviceJobPropSnake.heartbeat, true)
  heartbeat!: Date | null;

  @ColumnTemplate.CreateDate(RoutineDeviceJobPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RoutineDeviceJobPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RoutineDeviceJobPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ColumnTemplate.Date(RoutineDeviceJobPropSnake.in_progress_at, true)
  inProgressAt!: Date | null;

  @ColumnTemplate.Date(RoutineDeviceJobPropSnake.completed_at, true)
  completedAt!: Date | null;

  @ColumnTemplate.Date(RoutineDeviceJobPropSnake.local_in_progress_at, true)
  localInProgressAt!: Date | null;

  @ColumnTemplate.Date(RoutineDeviceJobPropSnake.local_completed_at, true)
  localCompletedAt!: Date | null;

  @ManyToOne(() => Device, { createForeignKeyConstraints: false })
  @JoinColumn({ name: RoutineDeviceJobPropSnake.device_id })
  device!: Device;

  @ManyToOne(() => RoutineJob, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RoutineDeviceJobPropSnake.routine_job_id })
  routineJob?: RoutineJob;

  @OneToMany(() => RoutineStep, (step) => step.routineDeviceJob, { cascade: ['soft-remove'] })
  routineSteps?: RoutineStep[];
}
