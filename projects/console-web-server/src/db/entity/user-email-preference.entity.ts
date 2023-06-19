import { UserEmailPreferenceBase, UserEmailPreferencePropSnake } from '@dogu-private/console';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { User } from './user.entity';

@Entity('user_email_preference')
export class UserEmailPreference implements UserEmailPreferenceBase {
  @PrimaryColumn({ type: 'uuid', name: UserEmailPreferencePropSnake.user_id })
  userId!: string;

  @Column({ type: 'smallint', name: UserEmailPreferencePropSnake.newsletter, default: 0, nullable: false })
  newsletter!: number;

  @ColumnTemplate.CreateDate(UserEmailPreferencePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(UserEmailPreferencePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(UserEmailPreferencePropSnake.deleted_at)
  deletedAt!: Date | null;

  @OneToOne(() => User, (user) => user.emailPreference, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: UserEmailPreferencePropSnake.user_id })
  user!: User;
}
