import { UserAndVerificationTokenBase, UserAndVerificationTokenPropCamel, UserAndVerificationTokenPropSnake } from '@dogu-private/console';
import { TokenId, UserId, USER_AND_VERIFICATION_TOKEN_TABLE_NAME, USER_VERIFICATION_STATUS } from '@dogu-private/types';
import { Exclude } from 'class-transformer';
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from '../decorators';
import { Token } from '../token.entity';
import { User } from '../user.entity';

@Entity(USER_AND_VERIFICATION_TOKEN_TABLE_NAME)
export class UserAndVerificationToken extends BaseEntity implements UserAndVerificationTokenBase {
  @PrimaryColumn({ type: 'uuid', name: UserAndVerificationTokenPropSnake.user_id, nullable: false })
  userId!: UserId;

  @Exclude()
  @ColumnTemplate.RelationUuid(UserAndVerificationTokenPropSnake.token_id, true)
  tokenId!: TokenId | null;

  @Column({ type: 'enum', name: UserAndVerificationTokenPropSnake.status, enum: USER_VERIFICATION_STATUS, default: USER_VERIFICATION_STATUS.PENDING, nullable: false })
  status!: USER_VERIFICATION_STATUS;

  @Exclude()
  @ColumnTemplate.CreateDate(UserAndVerificationTokenPropSnake.created_at)
  createdAt!: Date;

  @Exclude()
  @ColumnTemplate.UpdateDate(UserAndVerificationTokenPropSnake.updated_at)
  updatedAt!: Date;

  @Exclude()
  @ColumnTemplate.DeleteDate(UserAndVerificationTokenPropSnake.deleted_at)
  deletedAt!: Date | null;

  @Exclude()
  @OneToOne(() => Token, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION', cascade: ['soft-remove'] })
  @JoinColumn({ name: UserAndVerificationTokenPropSnake.token_id, referencedColumnName: UserAndVerificationTokenPropCamel.tokenId })
  token!: Token;

  @Exclude()
  @OneToOne(() => User, (user) => user.userAndVerificationToken, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: UserAndVerificationTokenPropSnake.user_id, referencedColumnName: UserAndVerificationTokenPropCamel.userId })
  user!: User;
}
