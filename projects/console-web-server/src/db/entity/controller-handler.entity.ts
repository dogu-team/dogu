import { ControllerHandlerBase } from '@dogu-private/console';
import {
  ControllerHandlerId,
  CONTROLLER_HANDLER_ACTION_NAME_MAX_LENGTH,
  CONTROLLER_HANDLER_CONTOLLER_NAME_MAX_LENGTH,
  CONTROLLER_HANDLER_METHOD_NAME_MAX_LENGTH,
  CONTROLLER_HANDLER_NAME_MAX_LENGTH,
  CONTROLLER_HANDLER_TABLE_NAME,
} from '@dogu-private/types';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';

@Entity(CONTROLLER_HANDLER_TABLE_NAME)
export class ControllerHandler extends BaseEntity implements ControllerHandlerBase {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'controller_handler_id', unsigned: true })
  controllerHandlerId!: ControllerHandlerId;

  @Column({ type: 'character varying', name: 'name', length: CONTROLLER_HANDLER_NAME_MAX_LENGTH, unique: false, nullable: false })
  name!: string;

  @Column({ type: 'character varying', name: 'controller_name', length: CONTROLLER_HANDLER_CONTOLLER_NAME_MAX_LENGTH, unique: false, nullable: false })
  controllerName!: string;

  @Column({ type: 'character varying', name: 'action_name', length: CONTROLLER_HANDLER_ACTION_NAME_MAX_LENGTH, unique: false, nullable: false })
  actionName!: string;

  @Column({ type: 'character varying', name: 'method_name', length: CONTROLLER_HANDLER_METHOD_NAME_MAX_LENGTH, unique: false, nullable: false })
  methodName!: string;

  @ColumnTemplate.CreateDate('created_at')
  createdAt!: Date;

  @ColumnTemplate.UpdateDate('updated_at')
  updatedAt!: Date;
}
