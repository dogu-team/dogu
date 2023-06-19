import { LogId, RoutineStepId } from '@dogu-private/types';

export interface LogBase {
  // entity
  logId: LogId;
  stepId: RoutineStepId;
  content: string;
  createdAt: Date;

  // relations

  // only response
}
