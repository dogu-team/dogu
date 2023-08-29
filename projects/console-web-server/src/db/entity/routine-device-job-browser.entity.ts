import { RoutineDeviceJobBrowserBase, RoutineDeviceJobBrowserPropSnake, RoutineDeviceJobPropCamel } from '@dogu-private/console';
import {
  BrowserName,
  RoutineDeviceJobBrowserId,
  RoutineDeviceJobId,
  ROUTINE_DEVICE_JOB_BROWSER_BROWSER_NAME_MAX_LENGTH,
  ROUTINE_DEVICE_JOB_BROWSER_BROWSER_VERSION_MAX_LENGTH,
  ROUTINE_DEVICE_JOB_BROWSER_TABLE_NAME,
} from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { RoutineDeviceJob } from './device-job.entity';

@Entity(ROUTINE_DEVICE_JOB_BROWSER_TABLE_NAME)
export class RoutineDeviceJobBrowser extends BaseEntity implements RoutineDeviceJobBrowserBase {
  @PrimaryGeneratedColumn('uuid', { name: RoutineDeviceJobBrowserPropSnake.routine_device_job_browser_id })
  routineDeviceJobBrowserId!: RoutineDeviceJobBrowserId;

  @Column({ type: 'character varying', name: RoutineDeviceJobBrowserPropSnake.browser_name, length: ROUTINE_DEVICE_JOB_BROWSER_BROWSER_NAME_MAX_LENGTH, nullable: false })
  browserName!: BrowserName;

  @Column({
    type: 'character varying',
    name: RoutineDeviceJobBrowserPropSnake.browser_version,
    length: ROUTINE_DEVICE_JOB_BROWSER_BROWSER_VERSION_MAX_LENGTH,
    default: '',
    nullable: false,
  })
  browserVersion!: string;

  @ColumnTemplate.CreateDate(RoutineDeviceJobBrowserPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RoutineDeviceJobBrowserPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RoutineDeviceJobBrowserPropSnake.deleted_at)
  deletedAt!: Date | null;

  @Column({ type: 'int', name: RoutineDeviceJobBrowserPropSnake.routine_device_job_id, unsigned: true, nullable: false })
  routineDeviceJobId!: RoutineDeviceJobId;

  @OneToOne(() => RoutineDeviceJob, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION', cascade: ['soft-remove'] })
  @JoinColumn({ name: RoutineDeviceJobBrowserPropSnake.routine_device_job_id, referencedColumnName: RoutineDeviceJobPropCamel.routineDeviceJobId })
  routineDeviceJob?: RoutineDeviceJob;
}
