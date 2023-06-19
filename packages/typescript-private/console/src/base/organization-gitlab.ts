import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export interface OrganizationGitlabBase {
  organizationId: string;
  gitlabGroupId: number;
  gitlabGroupToken: string;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const OrganizationGitlabPropCamel = propertiesOf<OrganizationGitlabBase>();
export const OrganizationGitlabPropSnake = camelToSnakeCasePropertiesOf<OrganizationGitlabBase>();
