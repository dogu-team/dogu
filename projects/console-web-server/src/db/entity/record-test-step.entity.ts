import { RecordTestCasePropCamel, RecordTestStepBase, RecordTestStepPropCamel, RecordTestStepPropSnake } from '@dogu-private/console';
import { DeviceId, ProjectId, RecordTestCaseId, RecordTestStepId, RECORD_TEST_STEP_ACTION_TYPE, RECORD_TEST_STEP_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Device } from './device.entity';
import { Project } from './project.entity';
import { RecordTestCase } from './record-test-case.entity';

@Entity(RECORD_TEST_STEP_TABLE_NAME)
export class RecordTestStep extends BaseEntity implements RecordTestStepBase {
  @PrimaryColumn({ type: 'uuid', name: RecordTestStepPropSnake.record_test_step_id })
  recordTestStepId!: RecordTestStepId;

  @ColumnTemplate.RelationUuid(RecordTestStepPropSnake.record_test_case_id)
  recordTestCaseId!: RecordTestCaseId;

  @ColumnTemplate.RelationUuid(RecordTestStepPropSnake.prev_record_test_step_id, true)
  prevRecordTestStepId!: RecordTestStepId | null;

  @ColumnTemplate.RelationUuid(RecordTestStepPropSnake.project_id)
  projectId!: ProjectId;

  @ColumnTemplate.RelationUuid(RecordTestStepPropSnake.device_id)
  deviceId!: DeviceId;

  @Column({ type: 'json', name: RecordTestStepPropSnake.device_info })
  deviceInfo!: Record<string, unknown>;

  @Column({ type: 'smallint', name: RecordTestStepPropSnake.type, default: RECORD_TEST_STEP_ACTION_TYPE.UNSPECIFIED, nullable: false })
  type!: RECORD_TEST_STEP_ACTION_TYPE;

  //
  @Column({ type: 'smallint', name: RecordTestStepPropSnake.device_screen_size_x, nullable: false })
  deviceScreenSizeX!: number;

  @Column({ type: 'smallint', name: RecordTestStepPropSnake.device_screen_size_y, nullable: false })
  deviceScreenSizeY!: number;

  @Column({ type: 'smallint', name: RecordTestStepPropSnake.bound_x, nullable: false })
  boundX!: number;

  @Column({ type: 'smallint', name: RecordTestStepPropSnake.bound_y, nullable: false })
  boundY!: number;

  @Column({ type: 'smallint', name: RecordTestStepPropSnake.bound_width, nullable: false })
  boundWidth!: number;

  @Column({ type: 'smallint', name: RecordTestStepPropSnake.bound_height, nullable: false })
  boundHeight!: number;

  @Column({ type: 'character varying', name: RecordTestStepPropSnake.xpath, nullable: true })
  xpath!: string | null;

  @Column({ type: 'character varying', name: RecordTestStepPropSnake.value, nullable: true })
  value!: string | null;
  //

  @ColumnTemplate.CreateDate(RecordTestStepPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RecordTestStepPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RecordTestStepPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => RecordTestCase, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestStepPropSnake.record_test_case_id, referencedColumnName: RecordTestCasePropCamel.recordTestCaseId })
  recordTestCase?: RecordTestCase;

  @ManyToOne(() => Device, (device) => device, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestStepPropSnake.device_id })
  device?: Device;

  @ManyToOne(() => Project, (project) => project, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestStepPropSnake.project_id })
  project?: Project;

  @ManyToOne(() => RecordTestStep, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestStepPropSnake.prev_record_test_step_id, referencedColumnName: RecordTestStepPropCamel.recordTestStepId })
  prevRecordTestStep?: RecordTestStep | null;
}
