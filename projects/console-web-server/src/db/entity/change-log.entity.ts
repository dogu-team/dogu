import { ChangeLogBase, ChangeLogBasePropSnake } from '@dogu-private/console';
import { CHANGE_LOG_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

import { ColumnTemplate } from './decorators';

@Entity(CHANGE_LOG_TABLE_NAME)
export class ChangeLog extends BaseEntity implements ChangeLogBase {
  @PrimaryColumn({ type: 'uuid', name: ChangeLogBasePropSnake.change_log_id, nullable: false })
  changeLogId!: string;

  @Column({ type: 'character varying', name: ChangeLogBasePropSnake.title, nullable: false })
  title!: string;

  @Column({ type: 'character varying', name: ChangeLogBasePropSnake.content, nullable: false })
  content!: string;

  @ColumnTemplate.CreateDate(ChangeLogBasePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(ChangeLogBasePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(ChangeLogBasePropSnake.deleted_at)
  deletedAt!: Date | null;
}
