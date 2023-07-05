// import { GitlabGroupId, GitlabGroupToken, OrganizationGitlabBase, OrganizationGitlabPropSnake } from '@dogu-private/console';
// import { OrganizationId, ORGANIZATION_GITLBA_GROUP_TOKEN_LENGTH, ORGANIZATION_GITLBA_TABLE_NAME } from '@dogu-private/types';
// import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

// import { ColumnTemplate } from './decorators';
// import { Organization } from './organization.entity';

// @Entity(ORGANIZATION_GITLBA_TABLE_NAME)
// export class OrganizationGitlab extends BaseEntity implements OrganizationGitlabBase {
//   @PrimaryColumn({ type: 'uuid', name: OrganizationGitlabPropSnake.organization_id })
//   organizationId!: OrganizationId;

//   @Column({ type: 'character varying', name: OrganizationGitlabPropSnake.gitlab_group_id, nullable: false })
//   gitlabGroupId!: GitlabGroupId;

//   @Column({ type: 'character varying', name: OrganizationGitlabPropSnake.gitlab_group_token, length: ORGANIZATION_GITLBA_GROUP_TOKEN_LENGTH, nullable: false })
//   gitlabGroupToken!: GitlabGroupToken;

//   @ColumnTemplate.CreateDate(OrganizationGitlabPropSnake.created_at)
//   createdAt!: Date;

//   @ColumnTemplate.UpdateDate(OrganizationGitlabPropSnake.updated_at)
//   updatedAt!: Date;

//   @ColumnTemplate.DeleteDate(OrganizationGitlabPropSnake.deleted_at)
//   deletedAt!: Date | null;

//   @OneToOne(() => Organization, (organization) => organization.gitlab, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
//   @JoinColumn({ name: OrganizationGitlabPropSnake.organization_id })
//   organization!: Organization;
// }
