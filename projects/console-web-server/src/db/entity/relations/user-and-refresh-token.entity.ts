import { UserAndRefreshTokenBase, UserAndRefreshTokenPropCamel, UserAndRefreshTokenPropSnake } from '@dogu-private/console';
import { TokenId, UserId, USER_AND_REFRESH_TOKEN_TABLE_NAME } from '@dogu-private/types';
import { Exclude } from 'class-transformer';
import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from '../decorators';
import { Token } from '../token.entity';
import { User } from '../user.entity';

@Entity(USER_AND_REFRESH_TOKEN_TABLE_NAME)
export class UserAndRefreshToken extends BaseEntity implements UserAndRefreshTokenBase {
  @PrimaryColumn({ type: 'uuid', name: UserAndRefreshTokenPropSnake.user_id, unique: false, nullable: false })
  userId!: UserId;

  @Exclude()
  @PrimaryColumn({ type: 'uuid', name: UserAndRefreshTokenPropSnake.token_id, unique: false, nullable: false })
  tokenId!: TokenId;

  @Exclude()
  @ColumnTemplate.CreateDate(UserAndRefreshTokenPropSnake.created_at)
  createdAt!: Date;

  @Exclude()
  @ColumnTemplate.DeleteDate(UserAndRefreshTokenPropSnake.deleted_at)
  deletedAt!: Date | null;

  @Exclude()
  @ManyToOne(() => Token, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: UserAndRefreshTokenPropSnake.token_id, referencedColumnName: UserAndRefreshTokenPropCamel.tokenId })
  token!: Token;

  @Exclude()
  @ManyToOne(() => User, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: UserAndRefreshTokenPropSnake.user_id, referencedColumnName: UserAndRefreshTokenPropCamel.userId })
  user!: User;
}
