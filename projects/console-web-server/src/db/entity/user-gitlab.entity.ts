// import { GitlabUserId, GitlabUserToken, UserGitlabBase, UserGitlabPropSnake } from '@dogu-private/console';
// import { USER_GITLAB_TABLE_NAME, USER_GITLAB_TOKEN_MAX_LENGTH } from '@dogu-private/types';
// import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
// import { ColumnTemplate } from './decorators';
// import { User } from './user.entity';

// @Entity(USER_GITLAB_TABLE_NAME)
// export class UserGitlab implements UserGitlabBase {
//   @PrimaryColumn({ type: 'uuid', name: UserGitlabPropSnake.user_id })
//   userId!: string;

//   @Column({ type: 'int', name: UserGitlabPropSnake.gitlab_user_id, nullable: false })
//   gitlabUserId!: GitlabUserId;

//   @Column({ type: 'character varying', name: UserGitlabPropSnake.gitlab_token, length: USER_GITLAB_TOKEN_MAX_LENGTH, nullable: false })
//   gitlabToken!: GitlabUserToken;

//   @ColumnTemplate.CreateDate(UserGitlabPropSnake.created_at)
//   createdAt!: Date;

//   @ColumnTemplate.UpdateDate(UserGitlabPropSnake.updated_at)
//   updatedAt!: Date;

//   @ColumnTemplate.DeleteDate(UserGitlabPropSnake.deleted_at)
//   deletedAt!: Date | null;

//   @OneToOne(() => User, (user) => user.gitlab, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
//   @JoinColumn({ name: UserGitlabPropSnake.user_id })
//   user!: User;
// }
