import { OrganizationId, ProjectApplicationIconFileName, ProjectApplicationId, ProjectId, UserId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { OrganizationBase, ProjectBase, UserBase } from '..';

export type ProjectApplicationWithIcon = ProjectApplicationBase & { iconUrl: string };
export interface ProjectApplicationRelationBaseTraits {
  creator: UserBase;
  organization: OrganizationBase;
  project: ProjectBase;
}
export interface ProjectApplicationBaseTraits {
  projectApplicationId: ProjectApplicationId;
  organizationId: OrganizationId;
  projectId: ProjectId;
  creatorId: UserId;
  name: string;
  iconFileName: ProjectApplicationIconFileName;
  fileName: string;
  fileExtension: string;
  fileSize: number;
  package: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type ProjectApplicationBase = ProjectApplicationBaseTraits & ProjectApplicationRelationBaseTraits;
export const ProjectApplicationPropCamel = propertiesOf<ProjectApplicationBase>();
export const ProjectApplicationPropSnake = camelToSnakeCasePropertiesOf<ProjectApplicationBase>();
