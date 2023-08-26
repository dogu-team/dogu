import { ProjectScmBitbucketAuthId, ProjectScmId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { ProjectScmBase } from './project-scm';

export interface ProjectScmBitbucketAuthRelationTraits {
  projectScm?: ProjectScmBase;
}

export interface ProjectScmBitbucketAuthBaseTraitsBase {
  projectScmBitbucketAuthId: ProjectScmBitbucketAuthId;
  projectScmId: ProjectScmId;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
export type ProjectScmBitbucketAuthBase = ProjectScmBitbucketAuthBaseTraitsBase & ProjectScmBitbucketAuthRelationTraits;
export const ProjectScmBitbucketAuthPropCamel = propertiesOf<ProjectScmBitbucketAuthBase>();
export const ProjectScmBitbucketAuthPropSnake = camelToSnakeCasePropertiesOf<ProjectScmBitbucketAuthBase>();
