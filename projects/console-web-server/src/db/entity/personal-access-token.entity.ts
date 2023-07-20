import { PersonalAccessTokenBase, PersonalAccessTokenPropSnake, TokenPropCamel, TokenPropSnake, UserPropCamel } from '@dogu-private/console';
import { PersonalAccessTokenId, PERSONAL_ACCESS_TOKEN_TABLE_NAME, TokenId, UserId } from '@dogu-private/types';
import { Exclude } from 'class-transformer';
import { BaseEntity, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Token } from './token.entity';
import { User } from './user.entity';

@Entity(PERSONAL_ACCESS_TOKEN_TABLE_NAME)
export class PersonalAccessToken extends BaseEntity implements PersonalAccessTokenBase {
  @PrimaryColumn({ type: 'uuid', name: PersonalAccessTokenPropSnake.personal_access_token_id, nullable: false })
  personalAccessTokenId!: PersonalAccessTokenId;

  @ColumnTemplate.RelationUuid(PersonalAccessTokenPropSnake.user_id)
  userId!: UserId;

  @Exclude()
  @ColumnTemplate.RelationUuid(PersonalAccessTokenPropSnake.token_id)
  tokenId!: TokenId;

  @ColumnTemplate.CreateDate(PersonalAccessTokenPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(PersonalAccessTokenPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(PersonalAccessTokenPropSnake.deleted_at)
  deletedAt!: Date | null;

  @Exclude()
  @ManyToOne(() => Token, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: TokenPropSnake.token_id, referencedColumnName: TokenPropCamel.tokenId })
  token!: Token;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({
    name: PersonalAccessTokenPropSnake.user_id, //
    referencedColumnName: UserPropCamel.userId,
  })
  user?: User;
}
