import { UserAndResetPasswordTokenBase, UserAndResetPasswordTokenPropSnake, UserAndVerificationTokenPropCamel } from '@dogu-private/console';
import { TokenId, UserId, USER_AND_RESET_PASSWORD_TOKEN_TABLE_NAME, USER_RESET_PASSWORD_STATUS } from '@dogu-private/types';
import { Exclude } from 'class-transformer';
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from '../decorators';
import { Token } from '../token.entity';
import { User } from '../user.entity';

@Entity(USER_AND_RESET_PASSWORD_TOKEN_TABLE_NAME)
export class UserAndResetPasswordToken extends BaseEntity implements UserAndResetPasswordTokenBase {
  @PrimaryColumn({ type: 'uuid', name: UserAndResetPasswordTokenPropSnake.user_id, nullable: false })
  userId!: UserId;

  @Exclude()
  @ColumnTemplate.RelationUuid(UserAndResetPasswordTokenPropSnake.token_id, true)
  tokenId!: TokenId;

  @Column({ type: 'enum', name: UserAndResetPasswordTokenPropSnake.status, enum: USER_RESET_PASSWORD_STATUS, default: USER_RESET_PASSWORD_STATUS.PENDING, nullable: false })
  status!: USER_RESET_PASSWORD_STATUS;

  @Exclude()
  @ColumnTemplate.CreateDate(UserAndResetPasswordTokenPropSnake.created_at)
  createdAt!: Date;

  @Exclude()
  @ColumnTemplate.UpdateDate(UserAndResetPasswordTokenPropSnake.updated_at)
  updatedAt!: Date;

  @Exclude()
  @ColumnTemplate.DeleteDate(UserAndResetPasswordTokenPropSnake.deleted_at)
  deletedAt!: Date | null;

  @Exclude()
  @OneToOne(() => Token, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION', cascade: ['soft-remove'] })
  @JoinColumn({ name: UserAndResetPasswordTokenPropSnake.token_id, referencedColumnName: UserAndVerificationTokenPropCamel.tokenId })
  token!: Token;

  @Exclude()
  @OneToOne(() => User, (user) => user.userAndVerificationToken, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: UserAndResetPasswordTokenPropSnake.user_id, referencedColumnName: UserAndVerificationTokenPropCamel.userId })
  user!: User;
}
