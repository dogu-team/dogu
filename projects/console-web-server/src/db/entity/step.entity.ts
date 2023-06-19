import { RoutineStepBase, RoutineStepPropSnake } from '@dogu-private/console';
import {
  PIPELINE_STATUS,
  RoutineDeviceJobId,
  RoutineStepId,
  ROUTINE_STEP_NAME_MAX_LENGTH,
  ROUTINE_STEP_RUN_MAX_LENGTH,
  ROUTINE_STEP_TABLE_NAME,
  ROUTINE_STEP_USES_MAX_LENGTH,
} from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Dest } from './dest.entity';
import { RoutineDeviceJob } from './device-job.entity';

@Entity(ROUTINE_STEP_TABLE_NAME)
export class RoutineStep extends BaseEntity implements RoutineStepBase {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: RoutineStepPropSnake.routine_step_id, unsigned: true })
  routineStepId!: RoutineStepId;

  @Column({ type: 'int', name: RoutineStepPropSnake.routine_device_job_id, unsigned: true, nullable: false })
  routineDeviceJobId!: RoutineDeviceJobId;

  @Column({ type: 'character varying', name: RoutineStepPropSnake.name, length: ROUTINE_STEP_NAME_MAX_LENGTH, nullable: false })
  name!: string;

  @Column({ type: 'smallint', name: RoutineStepPropSnake.status, default: PIPELINE_STATUS.WAITING, unsigned: true, nullable: false })
  status!: PIPELINE_STATUS;

  @Column({ type: 'int', name: RoutineStepPropSnake.index, unsigned: true, nullable: false })
  index!: number;

  @ColumnTemplate.CreateDate(RoutineStepPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RoutineStepPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RoutineStepPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ColumnTemplate.Date(RoutineStepPropSnake.local_in_progress_at, true)
  localInProgressAt!: Date | null;

  @ColumnTemplate.Date(RoutineStepPropSnake.local_completed_at, true)
  localCompletedAt!: Date | null;

  @ColumnTemplate.Date(RoutineStepPropSnake.in_progress_at, true)
  inProgressAt!: Date | null;

  @ColumnTemplate.Date(RoutineStepPropSnake.completed_at, true)
  completedAt!: Date | null;

  @ColumnTemplate.Date(RoutineStepPropSnake.heartbeat, true)
  heartbeat!: Date | null;

  @Column({ type: 'time', name: RoutineStepPropSnake.record_start_time, default: () => 'NULL', nullable: true })
  recordStartTime!: Date | null;

  @Column({ type: 'time', name: RoutineStepPropSnake.record_end_time, default: () => 'NULL', nullable: true })
  recordEndTime!: Date | null;

  @Column({ type: 'character varying', name: RoutineStepPropSnake.uses, length: ROUTINE_STEP_USES_MAX_LENGTH, default: () => 'NULL', nullable: true })
  uses!: string | null;

  @Column({ type: 'character varying', name: RoutineStepPropSnake.run, length: ROUTINE_STEP_RUN_MAX_LENGTH, default: () => 'NULL', nullable: true })
  run!: string | null;

  @Column({ type: 'json', name: RoutineStepPropSnake.with, default: () => 'NULL', nullable: true })
  with!: Record<string, unknown> | null;

  @Column({ type: 'json', name: RoutineStepPropSnake.env, default: () => 'NULL', nullable: true })
  env!: Record<string, string> | null;

  @ManyToOne(() => RoutineDeviceJob, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RoutineStepPropSnake.routine_device_job_id })
  routineDeviceJob?: RoutineDeviceJob;

  @OneToMany(() => Dest, (dest) => dest.routineStep, { cascade: ['soft-remove'] })
  dests?: Dest[];
}
