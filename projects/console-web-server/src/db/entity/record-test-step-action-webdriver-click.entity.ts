import { RecordTestStepActionWebdriverClickBase, RecordTestStepActionWebdriverClickPropSnake, RecordTestStepPropCamel } from '@dogu-private/console';
import { RecordTestStepActionWebdriverClickId, RecordTestStepId, RECORD_TEST_STEP_ACTION_WEBDRIVER_CLICK_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { RecordTestStep } from './record-test-step.entity';

@Entity(RECORD_TEST_STEP_ACTION_WEBDRIVER_CLICK_TABLE_NAME)
export class RecordTestStepActionWebdriverClick extends BaseEntity implements RecordTestStepActionWebdriverClickBase {
  @PrimaryColumn({ type: 'uuid', name: RecordTestStepActionWebdriverClickPropSnake.record_test_step_action_webdriver_click_id })
  recordTestStepActionWebdriverClickId!: RecordTestStepActionWebdriverClickId;

  @ColumnTemplate.RelationUuid(RecordTestStepActionWebdriverClickPropSnake.record_test_step_id)
  recordTestStepId!: RecordTestStepId;

  @Column({ type: 'smallint', name: RecordTestStepActionWebdriverClickPropSnake.device_screen_size_x, nullable: false })
  deviceScreenSizeX!: number;

  @Column({ type: 'smallint', name: RecordTestStepActionWebdriverClickPropSnake.device_screen_size_y, nullable: false })
  deviceScreenSizeY!: number;

  @Column({ type: 'character varying', name: RecordTestStepActionWebdriverClickPropSnake.xpath, nullable: false })
  xpath!: string;

  @Column({ type: 'smallint', name: RecordTestStepActionWebdriverClickPropSnake.bound_x, nullable: false })
  boundX!: number;

  @Column({ type: 'smallint', name: RecordTestStepActionWebdriverClickPropSnake.bound_y, nullable: false })
  boundY!: number;

  @Column({ type: 'smallint', name: RecordTestStepActionWebdriverClickPropSnake.bound_width, nullable: false })
  boundWidth!: number;

  @Column({ type: 'smallint', name: RecordTestStepActionWebdriverClickPropSnake.bound_height, nullable: false })
  boundHeight!: number;

  @ColumnTemplate.CreateDate(RecordTestStepActionWebdriverClickPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RecordTestStepActionWebdriverClickPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RecordTestStepActionWebdriverClickPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => RecordTestStep, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestStepActionWebdriverClickPropSnake.record_test_step_id, referencedColumnName: RecordTestStepPropCamel.recordTestStepId })
  recordTestStep?: RecordTestStep;
}
