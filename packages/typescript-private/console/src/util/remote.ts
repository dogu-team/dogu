import { REMOTE_DEVICE_JOB_STATE } from '@dogu-private/types';

export const isRemoteRunning = (states: REMOTE_DEVICE_JOB_STATE[]): boolean => {
  const isRunning = states.some((state) => {
    return state === REMOTE_DEVICE_JOB_STATE.WAITING || state === REMOTE_DEVICE_JOB_STATE.IN_PROGRESS;
  });

  return isRunning;
};
