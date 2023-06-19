export enum JOB_STATE {
  idle = 'idle',
  waiting = 'waiting',
  running = 'running',
  success = 'success',
  fail = 'fail',
}

export enum RESULT_CODE {
  fail = 'fail',
  success = 'success',
  unknown = 'unknown',
}

export enum TASK_STATE {
  START = 'start',
  RUN = 'run',
}
