import { ProjectId, RoutineId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { ProjectBase } from './project';

export interface ProjectSlackRoutineBaseTrait {
  projectId: ProjectId;
  routineId: RoutineId;
  channelId: string;
  onSuccess: number;
  onFailure: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ProjectSlackRoutineRelationTraits {
  project?: ProjectBase;
}

export type ProjectSlackRoutineBase = ProjectSlackRoutineBaseTrait & ProjectSlackRoutineRelationTraits;
export const ProjectSlackRoutinePropCamel = propertiesOf<ProjectSlackRoutineBaseTrait>();
export const ProjectSlackRoutinePropSnake = camelToSnakeCasePropertiesOf<ProjectSlackRoutineBase>();
