import { RecordTestCaseBase, RecordTestCasePropSnake } from '@dogu-private/console';
import { Platform, ProjectId, RecordTestCaseId, RECORD_TEST_CASE_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Device } from './device.entity';
import { Project } from './project.entity';
import { RecordTestStep } from './record-test-step.entity';

@Entity(RECORD_TEST_CASE_TABLE_NAME)
export class RecordTestCase extends BaseEntity implements RecordTestCaseBase {
  @PrimaryColumn({ type: 'uuid', name: RecordTestCasePropSnake.record_test_case_id })
  recordTestCaseId!: RecordTestCaseId;

  @ColumnTemplate.RelationUuid(RecordTestCasePropSnake.project_id)
  projectId!: ProjectId;

  @Column({ type: 'character varying', name: RecordTestCasePropSnake.name, nullable: false })
  name!: string;

  @Column({ type: 'smallint', name: RecordTestCasePropSnake.platform, unsigned: true, default: Platform.PLATFORM_UNSPECIFIED, nullable: false })
  platform!: Platform;

  @ColumnTemplate.RelationUuid(RecordTestCasePropSnake.active_device_id, true)
  activeDeviceId!: string | null;

  @Column({ type: 'smallint', name: RecordTestCasePropSnake.active_device_screen_size_x, nullable: true })
  activeDeviceScreenSizeX!: number | null;

  @Column({ type: 'smallint', name: RecordTestCasePropSnake.active_device_screen_size_y, nullable: true })
  activeDeviceScreenSizeY!: number | null;

  @Column({ type: 'uuid', name: RecordTestCasePropSnake.active_session_id, nullable: true })
  activeSessionId!: string | null;

  @Column({ type: 'uuid', name: RecordTestCasePropSnake.active_session_key, nullable: true })
  activeSessionKey!: string | null;

  @Column({ type: 'character varying', name: RecordTestCasePropSnake.package_name, nullable: true })
  packageName!: string | null;

  @Column({ type: 'character varying', name: RecordTestCasePropSnake.browser_name, nullable: true })
  browserName!: string | null;

  @ColumnTemplate.CreateDate(RecordTestCasePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RecordTestCasePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RecordTestCasePropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => Project, (project) => project, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestCasePropSnake.project_id })
  project?: Project;

  @ManyToOne(() => Device, (device) => device, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestCasePropSnake.active_device_id })
  device?: Device;

  @OneToMany(() => RecordTestStep, (recordTestStep) => recordTestStep.recordTestCase, { cascade: ['soft-remove'] })
  recordTestSteps?: RecordTestStep[];
}
