import { LogLevel } from '@dogu-tech/common';

export enum STEP_LOG_TYPE {
  UNKNOWN = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
}

export interface StepLogInfo {
  type: STEP_LOG_TYPE;
  message: string;
  timestamp: string;
  // localTimeStamp: string;
  stepId: number;
  line: number;
  level: LogLevel;
}
