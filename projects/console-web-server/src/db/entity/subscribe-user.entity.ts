import { SubscribeUserBase, SubscribeUserPropCamel, SubscribeUserPropSnake } from '@dogu-private/console';
import { SUBSCRIBE_USER_STATUS, SUBSCRIBE_USER_TABLE_NAME, TokenId, USER_EMAIL_MAX_LENGTH } from '@dogu-private/types';
import { Exclude } from 'class-transformer';
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Token } from './token.entity';

@Entity(SUBSCRIBE_USER_TABLE_NAME)
export class SubscribeUser extends BaseEntity implements SubscribeUserBase {
  @PrimaryGeneratedColumn('increment', { type: 'int', unsigned: true, name: SubscribeUserPropSnake.subscribe_user_id })
  subscribeUserId!: number;

  @ColumnTemplate.RelationUuid(SubscribeUserPropSnake.token_id, true)
  tokenId!: TokenId;

  @Column({ type: 'character varying', name: SubscribeUserPropSnake.email, length: USER_EMAIL_MAX_LENGTH, unique: true })
  email!: string;

  @Column({ type: 'enum', name: SubscribeUserPropSnake.status, enum: SUBSCRIBE_USER_STATUS, default: SUBSCRIBE_USER_STATUS.SUBSCRIBE, nullable: false })
  status!: SUBSCRIBE_USER_STATUS;

  @ColumnTemplate.CreateDate(SubscribeUserPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(SubscribeUserPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(SubscribeUserPropSnake.deleted_at)
  deletedAt!: Date | null;

  @Exclude()
  @OneToOne(() => Token, { cascade: ['soft-remove'], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: SubscribeUserPropSnake.token_id, referencedColumnName: SubscribeUserPropCamel.tokenId })
  token!: Token;
}
