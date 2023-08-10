import { ChangeLogUserReactionBase, ChangeLogUserReactionBasePropSnake } from '@dogu-private/console';
import { ChangeLogReactionType, CHANGE_LOG_USER_REACTION_TABLE_NAME, UserId } from '@dogu-private/types';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from '../decorators';

@Entity(CHANGE_LOG_USER_REACTION_TABLE_NAME)
export class ChangeLogUserReaction extends BaseEntity implements ChangeLogUserReactionBase {
  @PrimaryColumn({ type: 'uuid', name: ChangeLogUserReactionBasePropSnake.change_log_user_reaction_id, nullable: false })
  changeLogUserReactionId!: string;

  @Column({ type: 'uuid', name: ChangeLogUserReactionBasePropSnake.change_log_id, nullable: false })
  changeLogId!: string;

  @Column({ type: 'uuid', name: ChangeLogUserReactionBasePropSnake.user_id, nullable: false })
  userId!: UserId;

  @Column({ type: 'character varying', name: ChangeLogUserReactionBasePropSnake.reaction_type, nullable: false })
  reactionType!: ChangeLogReactionType;

  @ColumnTemplate.CreateDate(ChangeLogUserReactionBasePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(ChangeLogUserReactionBasePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(ChangeLogUserReactionBasePropSnake.deleted_at)
  deletedAt!: Date | null;
}
