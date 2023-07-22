import { DEST_STATE, REMOTE_DEVICE_JOB_SESSION_STATE, REMOTE_DEVICE_JOB_STATE } from '@dogu-private/types';
import { RemoteBase, RemoteDeviceJobBase } from '..';

export const isRemoteRunning = (remote: RemoteBase): boolean => {
  const remoteDeviceJob = (remote.remoteDeviceJobs = remote.remoteDeviceJobs || []);
  if (remoteDeviceJob.length === 0) {
    throw new Error(`remote has no remoteDeviceJob. remoteId: ${remote.remoteId}`);
  }

  const remoteDeviceJobsIsRunning = remoteDeviceJob.map((remoteDeviceJob) => {
    return (
      isRemoteDeviceJobState(remoteDeviceJob, REMOTE_DEVICE_JOB_STATE.WAITING) || isRemoteDeviceJobState(remoteDeviceJob, REMOTE_DEVICE_JOB_STATE.IN_PROGRESS)
      // isRemoteDeviceJobState(remoteDeviceJob, REMOTE_DEVICE_JOB_STATE.CANCEL_REQUESTED)
    );
  });

  const isRunning = remoteDeviceJobsIsRunning.every((isRunning) => isRunning);
  return isRunning;
};

type USEABLE_REMOTE_DEVICE_JOB_STATE = Extract<
  REMOTE_DEVICE_JOB_STATE,
  REMOTE_DEVICE_JOB_STATE.WAITING | REMOTE_DEVICE_JOB_STATE.IN_PROGRESS | REMOTE_DEVICE_JOB_STATE.SUCCESS | REMOTE_DEVICE_JOB_STATE.FAILURE
>;

export const isRemoteDeviceJobState = (remoteDeviceJob: RemoteDeviceJobBase, targetState: USEABLE_REMOTE_DEVICE_JOB_STATE): boolean => {
  const remoteDests = remoteDeviceJob.remoteDests || [];
  if (remoteDests.length === 0) {
    switch (targetState) {
      case REMOTE_DEVICE_JOB_STATE.WAITING:
        return remoteDeviceJob.sessionState === REMOTE_DEVICE_JOB_SESSION_STATE.WAITING;
      case REMOTE_DEVICE_JOB_STATE.IN_PROGRESS:
        return remoteDeviceJob.sessionState === REMOTE_DEVICE_JOB_SESSION_STATE.IN_PROGRESS;
      // case REMOTE_DEVICE_JOB_STATE.CANCEL_REQUESTED:
      //   return remoteDeviceJob.sessionState === REMOTE_DEVICE_JOB_SESSION_STATE.IN_PROGRESS;
      case REMOTE_DEVICE_JOB_STATE.SUCCESS:
        return remoteDeviceJob.sessionState === REMOTE_DEVICE_JOB_SESSION_STATE.COMPLETE;
      case REMOTE_DEVICE_JOB_STATE.FAILURE:
        return remoteDeviceJob.sessionState === REMOTE_DEVICE_JOB_SESSION_STATE.FAILURE;
      default:
        throw new Error(`Unexpected state: ${targetState}`);
    }
  } else {
    const stateByDest = getRemoteDeviceJobStateByRemoteDest(remoteDeviceJob);
    return stateByDest === targetState;
  }
};

export const getRemoteDeviceJobState = (remoteDeviceJob: RemoteDeviceJobBase): REMOTE_DEVICE_JOB_STATE => {
  const remoteDests = remoteDeviceJob.remoteDests || [];
  if (remoteDests.length === 0) {
    switch (remoteDeviceJob.sessionState) {
      case REMOTE_DEVICE_JOB_SESSION_STATE.WAITING:
        return REMOTE_DEVICE_JOB_STATE.WAITING;
      case REMOTE_DEVICE_JOB_SESSION_STATE.IN_PROGRESS:
        return REMOTE_DEVICE_JOB_STATE.IN_PROGRESS;
      case REMOTE_DEVICE_JOB_SESSION_STATE.COMPLETE:
        return REMOTE_DEVICE_JOB_STATE.SUCCESS;
      case REMOTE_DEVICE_JOB_SESSION_STATE.FAILURE:
        return REMOTE_DEVICE_JOB_STATE.FAILURE;
      default:
        return REMOTE_DEVICE_JOB_STATE.UNSPECIFIED;
    }
  } else {
    const stateByDest = getRemoteDeviceJobStateByRemoteDest(remoteDeviceJob);
    return stateByDest;
  }
};

export const getRemoteDeviceJobStateByRemoteDest = (remoteDeviceJob: RemoteDeviceJobBase): REMOTE_DEVICE_JOB_STATE => {
  const remoteDests = remoteDeviceJob.remoteDests || [];
  if (remoteDests.length === 0) {
    throw new Error(`remoteDests is empty. remoteDeviceJobId: ${remoteDeviceJob.remoteDeviceJobId}`);
  }

  const isWaiting = remoteDests.every((remoteDest) => {
    return remoteDest.state === DEST_STATE.PENDING;
  });
  if (isWaiting) return REMOTE_DEVICE_JOB_STATE.WAITING;

  const isSuccess = remoteDests.every((remoteDest) => {
    return remoteDest.state === DEST_STATE.PASSED;
  });
  if (isSuccess) return REMOTE_DEVICE_JOB_STATE.SUCCESS;

  const isFailure = remoteDests.some((remoteDest) => {
    return remoteDest.state === DEST_STATE.FAILED;
  });
  if (isFailure) return REMOTE_DEVICE_JOB_STATE.FAILURE;

  if (remoteDeviceJob.sessionState === REMOTE_DEVICE_JOB_SESSION_STATE.IN_PROGRESS) return REMOTE_DEVICE_JOB_STATE.IN_PROGRESS;

  if (isRemoteDeviceJobSessionCompleted(remoteDeviceJob.sessionState)) return REMOTE_DEVICE_JOB_STATE.UNSPECIFIED;

  return REMOTE_DEVICE_JOB_STATE.UNSPECIFIED;
};

export function isRemoteDeviceJobCompleted(state: REMOTE_DEVICE_JOB_STATE): boolean {
  return (
    state === REMOTE_DEVICE_JOB_STATE.SUCCESS || //
    state === REMOTE_DEVICE_JOB_STATE.FAILURE ||
    state === REMOTE_DEVICE_JOB_STATE.CANCELLED ||
    state === REMOTE_DEVICE_JOB_STATE.SKIPPED
  );
}

export function isRemoteDeviceJobSessionCompleted(sessionState: REMOTE_DEVICE_JOB_SESSION_STATE): boolean {
  return (
    sessionState === REMOTE_DEVICE_JOB_SESSION_STATE.COMPLETE || //
    sessionState === REMOTE_DEVICE_JOB_SESSION_STATE.FAILURE
  );
}
