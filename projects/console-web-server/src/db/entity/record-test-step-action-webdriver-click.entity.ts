import { RecordTestStepActionPropCamel, RecordTestStepActionWebdriverClickBase, RecordTestStepActionWebdriverClickPropSnake } from '@dogu-private/console';
import { RecordTestStepActionId, RecordTestStepActionWebdriverClickId, RECORD_TEST_STEP_ACTION_WEBDRIVER_CLICK_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { RecordTestStepAction } from './record-test-step-action.entity';

@Entity(RECORD_TEST_STEP_ACTION_WEBDRIVER_CLICK_TABLE_NAME)
export class RecordTestStepActionWebdriverClick extends BaseEntity implements RecordTestStepActionWebdriverClickBase {
  @PrimaryColumn({ type: 'uuid', name: RecordTestStepActionWebdriverClickPropSnake.record_test_step_action_webdriver_click_id })
  recordTestStepActionWebdriverClickId!: RecordTestStepActionWebdriverClickId;

  @ColumnTemplate.RelationUuid(RecordTestStepActionWebdriverClickPropSnake.record_test_step_action_id)
  recordTestStepActionId!: RecordTestStepActionId;

  @Column({ type: 'smallint', name: RecordTestStepActionWebdriverClickPropSnake.screen_size_x, nullable: false })
  screenSizeX!: number;

  @Column({ type: 'smallint', name: RecordTestStepActionWebdriverClickPropSnake.screen_size_y, nullable: false })
  screenSizeY!: number;

  @Column({ type: 'smallint', name: RecordTestStepActionWebdriverClickPropSnake.screen_position_x, nullable: false })
  screenPositionX!: number;

  @Column({ type: 'smallint', name: RecordTestStepActionWebdriverClickPropSnake.screen_position_y, nullable: false })
  screenPositionY!: number;

  @Column({ type: 'character varying', name: RecordTestStepActionWebdriverClickPropSnake.xpath, nullable: false })
  xpath!: string;

  @ColumnTemplate.CreateDate(RecordTestStepActionWebdriverClickPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RecordTestStepActionWebdriverClickPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RecordTestStepActionWebdriverClickPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => RecordTestStepAction, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RecordTestStepActionWebdriverClickPropSnake.record_test_step_action_id, referencedColumnName: RecordTestStepActionPropCamel.recordTestStepActionId })
  recordTestStepAction?: RecordTestStepAction;
}
