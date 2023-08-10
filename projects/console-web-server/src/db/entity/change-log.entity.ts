import { ChangeLogBase, ChangeLogBasePropSnake } from '@dogu-private/console';
import { ChangeLogId, CHANGE_LOG_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm';

import { ColumnTemplate } from './decorators';
import { ChangeLogUserReaction } from './index';

@Entity(CHANGE_LOG_TABLE_NAME)
export class ChangeLog extends BaseEntity implements ChangeLogBase {
  @PrimaryColumn({ type: 'uuid', name: ChangeLogBasePropSnake.change_log_id, nullable: false })
  changeLogId!: ChangeLogId;

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

  @OneToMany(() => ChangeLogUserReaction, (reaction) => reaction.changeLog, { cascade: ['soft-remove'] })
  userReactions?: ChangeLogUserReaction[];
}
