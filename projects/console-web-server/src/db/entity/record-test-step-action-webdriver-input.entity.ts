import { RecordTestStepActionWebdriverInputBase, RecordTestStepActionWebdriverInputPropSnake, RecordTestStepPropCamel } from '@dogu-private/console';
import { RecordTestStepActionWebdriverInputId, RecordTestStepId, RECORD_TEST_STEP_ACTION_WEBDRIVER_INPUT_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { RecordTestStep } from './record-test-step.entity';

@Entity(RECORD_TEST_STEP_ACTION_WEBDRIVER_INPUT_TABLE_NAME)
export class RecordTestStepActionWebdriverInput extends BaseEntity implements RecordTestStepActionWebdriverInputBase {
  @PrimaryColumn({ type: 'uuid', name: RecordTestStepActionWebdriverInputPropSnake.record_test_step_action_webdriver_input_id })
  recordTestStepActionWebdriverInputId!: RecordTestStepActionWebdriverInputId;

  @ColumnTemplate.RelationUuid(RecordTestStepActionWebdriverInputPropSnake.record_test_step_id)
  recordTestStepId!: RecordTestStepId;

  @Column({ type: 'smallint', name: RecordTestStepActionWebdriverInputPropSnake.device_screen_size_x, nullable: false })
  deviceScreenSizeX!: number;

  @Column({ type: 'smallint', name: RecordTestStepActionWebdriverInputPropSnake.device_screen_size_y, nullable: false })
  deviceScreenSizeY!: number;

  @Column({ type: 'character varying', name: RecordTestStepActionWebdriverInputPropSnake.value, nullable: false })
  value!: string;

  @Column({ type: 'smallint', name: RecordTestStepActionWebdriverInputPropSnake.bound_x, nullable: false })
  boundX!: number;

  @Column({ type: 'smallint', name: RecordTestStepActionWebdriverInputPropSnake.bound_y, nullable: false })
  boundY!: number;

  @Column({ type: 'smallint', name: RecordTestStepActionWebdriverInputPropSnake.bound_width, nullable: false })
  boundWidth!: number;

  @Column({ type: 'smallint', name: RecordTestStepActionWebdriverInputPropSnake.bound_height, nullable: false })
  boundHeight!: number;

  @ColumnTemplate.CreateDate(RecordTestStepActionWebdriverInputPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RecordTestStepActionWebdriverInputPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RecordTestStepActionWebdriverInputPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => RecordTestStep, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestStepActionWebdriverInputPropSnake.record_test_step_id, referencedColumnName: RecordTestStepPropCamel.recordTestStepId })
  recordTestStep?: RecordTestStep;
}
