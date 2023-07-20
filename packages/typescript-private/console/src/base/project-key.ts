import { ProjectId, ProjectKeyId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { ProjectBase } from './project';

interface ProjectKeyRelationTraits {
  project?: ProjectBase;
}

export interface ProjectKeyBaseTraits {
  projectKeyId: ProjectKeyId;
  projectId: ProjectId;
  key: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type ProjectKeyBase = ProjectKeyBaseTraits & ProjectKeyRelationTraits;
export const ProjectKeyPropCamel = propertiesOf<ProjectKeyBase>();
export const ProjectKeyPropSnake = camelToSnakeCasePropertiesOf<ProjectKeyBase>();
