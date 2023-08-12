import { ChangeLogUserReactionBase, ChangeLogUserReactionBasePropSnake } from '@dogu-private/console';
import { ChangeLogId, ChangeLogReactionType, ChangeLogUserReactionId, CHANGE_LOG_USER_REACTION_TABLE_NAME, UserId } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ChangeLog } from '../change-log.entity';
import { ColumnTemplate } from '../decorators';
import { User } from '../user.entity';

@Entity(CHANGE_LOG_USER_REACTION_TABLE_NAME)
export class ChangeLogUserReaction extends BaseEntity implements ChangeLogUserReactionBase {
  @PrimaryColumn({ type: 'uuid', name: ChangeLogUserReactionBasePropSnake.change_log_user_reaction_id, nullable: false })
  changeLogUserReactionId!: ChangeLogUserReactionId;

  @Column({ type: 'uuid', name: ChangeLogUserReactionBasePropSnake.change_log_id, nullable: false })
  changeLogId!: ChangeLogId;

  @Column({ type: 'uuid', name: ChangeLogUserReactionBasePropSnake.user_id, nullable: false })
  userId!: UserId;

  @Column({ type: 'smallint', name: ChangeLogUserReactionBasePropSnake.reaction_type, nullable: false })
  reactionType!: ChangeLogReactionType;

  @ColumnTemplate.CreateDate(ChangeLogUserReactionBasePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(ChangeLogUserReactionBasePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(ChangeLogUserReactionBasePropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => ChangeLog, (changeLog) => changeLog.userReactions, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: ChangeLogUserReactionBasePropSnake.change_log_id })
  changeLog?: ChangeLog;

  @ManyToOne(() => User, (user) => user.changeLogReactions, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
