export type RemoteDeviceJobId = string;

export const REMOTE_DEVICE_JOB_TABLE_NAME = 'remote_device_job';

export enum REMOTE_DEVICE_JOB_STATE {
  UNSPECIFIED = 0,
  WAITING = 1,
  IN_PROGRESS = 2,
  COMPLETE = 3,
  FAILURE = 4,
}

export function isRemoteDeviceJobCompleted(state: REMOTE_DEVICE_JOB_STATE): boolean {
  return (
    state === REMOTE_DEVICE_JOB_STATE.COMPLETE || //
    state === REMOTE_DEVICE_JOB_STATE.FAILURE
  );
}
