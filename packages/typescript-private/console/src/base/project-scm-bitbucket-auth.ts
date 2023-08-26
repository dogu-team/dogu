import { ProjectScmBitBucketAuthId, ProjectScmId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { ProjectScmBase } from './project-scm';

export interface ProjectScmBitBucketAuthRelationTraits {
  projectScm?: ProjectScmBase;
}

export interface ProjectScmBitBucketAuthBaseTraitsBase {
  projectScmBitBucketAuthId: ProjectScmBitBucketAuthId;
  projectScmId: ProjectScmId;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
export type ProjectScmBitBucketAuthBase = ProjectScmBitBucketAuthBaseTraitsBase & ProjectScmBitBucketAuthRelationTraits;
export const ProjectScmBitBucketAuthPropCamel = propertiesOf<ProjectScmBitBucketAuthBase>();
export const ProjectScmBitBucketAuthPropSnake = camelToSnakeCasePropertiesOf<ProjectScmBitBucketAuthBase>();
