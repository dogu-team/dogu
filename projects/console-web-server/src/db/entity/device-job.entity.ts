import { RoutineDeviceJobBase, RoutineDeviceJobPropSnake } from '@dogu-private/console';
import {
  BrowserName,
  DeviceId,
  DeviceRunnerId,
  PIPELINE_STATUS,
  RoutineDeviceJobId,
  RoutineJobId,
  ROUTINE_DEVICE_JOB_APP_PACKAGE_NAME_MAX_LENGTH,
  ROUTINE_DEVICE_JOB_APP_VERSION_MAX_LENGTH,
  ROUTINE_DEVICE_JOB_BROWSER_NAME_MAX_LENGTH,
  ROUTINE_DEVICE_JOB_BROWSER_VERSION_MAX_LENGTH,
  ROUTINE_DEVICE_JOB_TABLE_NAME,
} from '@dogu-private/types';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { DeviceRunner } from './device-runner.entity';
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

  @Column({ type: 'character varying', name: RoutineDeviceJobPropSnake.app_version, length: ROUTINE_DEVICE_JOB_APP_VERSION_MAX_LENGTH, nullable: true })
  appVersion!: string | null;

  @Column({ type: 'character varying', name: RoutineDeviceJobPropSnake.app_package_name, length: ROUTINE_DEVICE_JOB_APP_PACKAGE_NAME_MAX_LENGTH, nullable: true })
  appPackageName!: string | null;

  @Column({ type: 'character varying', name: RoutineDeviceJobPropSnake.browser_name, length: ROUTINE_DEVICE_JOB_BROWSER_NAME_MAX_LENGTH, nullable: true })
  browserName!: BrowserName | null;

  @Column({ type: 'character varying', name: RoutineDeviceJobPropSnake.browser_version, length: ROUTINE_DEVICE_JOB_BROWSER_VERSION_MAX_LENGTH, nullable: true })
  browserVersion!: string | null;

  @Column({ type: 'int', name: RoutineDeviceJobPropSnake.window_process_id, unsigned: true, nullable: true })
  windowProcessId!: number | null;

  @ColumnTemplate.Date(RoutineDeviceJobPropSnake.heartbeat, true)
  @Type(() => Date)
  @IsOptional()
  heartbeat!: Date | null;

  @ColumnTemplate.RelationUuid(RoutineDeviceJobPropSnake.device_runner_id, true)
  deviceRunnerId!: DeviceRunnerId | null;

  @ColumnTemplate.CreateDate(RoutineDeviceJobPropSnake.created_at)
  @Type(() => Date)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RoutineDeviceJobPropSnake.updated_at)
  @Type(() => Date)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RoutineDeviceJobPropSnake.deleted_at)
  @Type(() => Date)
  @IsOptional()
  deletedAt!: Date | null;

  @ColumnTemplate.Date(RoutineDeviceJobPropSnake.in_progress_at, true)
  @Type(() => Date)
  @IsOptional()
  inProgressAt!: Date | null;

  @ColumnTemplate.Date(RoutineDeviceJobPropSnake.completed_at, true)
  @Type(() => Date)
  @IsOptional()
  completedAt!: Date | null;

  @ColumnTemplate.Date(RoutineDeviceJobPropSnake.local_in_progress_at, true)
  @Type(() => Date)
  @IsOptional()
  localInProgressAt!: Date | null;

  @ColumnTemplate.Date(RoutineDeviceJobPropSnake.local_completed_at, true)
  @Type(() => Date)
  @IsOptional()
  localCompletedAt!: Date | null;

  @ManyToOne(() => Device, { createForeignKeyConstraints: false })
  @JoinColumn({ name: RoutineDeviceJobPropSnake.device_id })
  device?: Device;

  @ManyToOne(() => RoutineJob, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RoutineDeviceJobPropSnake.routine_job_id })
  routineJob?: RoutineJob;

  @OneToMany(() => RoutineStep, (step) => step.routineDeviceJob, { cascade: ['soft-remove'] })
  routineSteps?: RoutineStep[];

  @ManyToOne(() => DeviceRunner, (deviceRunner) => deviceRunner.routineDeviceJobs, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RoutineDeviceJobPropSnake.device_runner_id })
  deviceRunner?: DeviceRunner;
}
