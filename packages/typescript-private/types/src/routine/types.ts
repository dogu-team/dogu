import { ProjectId } from '..';

export type RoutineId = string;

export const ROUTINE_TABLE_NAME = 'routine';

export const ROUTINE_NAME_MIN_LENGTH = 1;
export const ROUTINE_NAME_MAX_LENGTH = 50;
export const ROUTINE_CONFIG_URL_MAX_LENGTH = 512;

export interface Routine {
  routineId: RoutineId;
  projectId: ProjectId;
  name: string;
  lastIndex: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
