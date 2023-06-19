import { TokenBase, TokenPropSnake } from '@dogu-private/console';
import { TokenId, TOKEN_MAX_LENGTH, TOKEN_TABEL_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';

@Entity(TOKEN_TABEL_NAME)
export class Token extends BaseEntity implements TokenBase {
  @PrimaryGeneratedColumn('uuid', { name: TokenPropSnake.token_id })
  tokenId!: TokenId;

  @Column({ type: 'character varying', name: TokenPropSnake.token, length: TOKEN_MAX_LENGTH, unique: true, nullable: false })
  token!: string;

  @ColumnTemplate.CreateDate(TokenPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.Date(TokenPropSnake.expired_at, true)
  expiredAt!: Date | null;

  @ColumnTemplate.DeleteDate(TokenPropSnake.deleted_at)
  deletedAt!: Date | null;
}
