// import { UserKeyBase, UserKeyPropSnake, UserPropCamel } from '@dogu-private/console';
// import { UserId, UserKeyId, USER_KEY_TABLE_NAME } from '@dogu-private/types';
// import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
// import { ColumnTemplate } from './decorators';
// import { User } from './user.entity';

// @Entity(USER_KEY_TABLE_NAME)
// export class UserKey extends BaseEntity implements UserKeyBase {
//   @PrimaryColumn({ type: 'uuid', name: UserKeyPropSnake.user_key_id, nullable: false })
//   userKeyId!: UserKeyId;

//   @ColumnTemplate.RelationUuid(UserKeyPropSnake.user_id)
//   userId!: UserId;

//   @Column({ type: 'character varying', name: UserKeyPropSnake.key, nullable: false })
//   key!: string;

//   @ColumnTemplate.CreateDate(UserKeyPropSnake.created_at)
//   createdAt!: Date;

//   @ColumnTemplate.UpdateDate(UserKeyPropSnake.updated_at)
//   updatedAt!: Date;

//   @ColumnTemplate.DeleteDate(UserKeyPropSnake.deleted_at)
//   deletedAt!: Date | null;

//   @OneToOne(() => User, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
//   @JoinColumn({ name: UserKeyPropSnake.user_id, referencedColumnName: UserPropCamel.userId })
//   user?: User;
// }
