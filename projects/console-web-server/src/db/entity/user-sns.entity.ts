import { UserSnsBase, UserSnsBasePropCamel, UserSnsBasePropSnake } from '@dogu-private/console';
import { SNS_TYPE, UserId, UserSnsId, USER_SNS_MAX_NAME_LENGTH, USER_SNS_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { User } from './user.entity';

@Entity(USER_SNS_TABLE_NAME)
export class UserSns extends BaseEntity implements UserSnsBase {
  @PrimaryColumn({ type: 'uuid', name: UserSnsBasePropSnake.user_id, nullable: false })
  userId!: UserId;

  @Column({ type: 'character varying', unique: true, name: UserSnsBasePropSnake.user_sns_id, length: USER_SNS_MAX_NAME_LENGTH, nullable: false })
  userSnsId!: UserSnsId;

  @Column({ type: 'enum', name: UserSnsBasePropSnake.sns_type, enum: SNS_TYPE, default: SNS_TYPE.UNSPECIFIED, nullable: false })
  snsType!: SNS_TYPE;

  @ColumnTemplate.CreateDate(UserSnsBasePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(UserSnsBasePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(UserSnsBasePropSnake.deleted_at)
  deletedAt!: Date | null;

  @OneToOne(() => User, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: UserSnsBasePropSnake.user_id, referencedColumnName: UserSnsBasePropCamel.userId })
  user?: User;
}
