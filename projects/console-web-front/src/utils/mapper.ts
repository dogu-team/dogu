import { DEST_STATE, DeviceConnectionState, PIPELINE_STATUS, REMOTE_DEVICE_JOB_STATE } from '@dogu-private/types';
import { DeviceLogLevel } from '../types/device';
import { ORGANIZATION_ROLE } from '../types/organization';

export enum DeviceConnectionStateText {
  DISCONNECTED = 'Disconnected',
  CONNECTED = 'Connected',
  UNKNOWN = 'Unknown',
}

export const deviceConnectionStateTextColorMap: { [key in DeviceConnectionStateText]: string } = {
  [DeviceConnectionStateText.CONNECTED]: '#15a803',
  [DeviceConnectionStateText.DISCONNECTED]: '#ff4d4f',
  [DeviceConnectionStateText.UNKNOWN]: '#888',
};

export const mapDeviceConnectionStateToString = (connectionState: DeviceConnectionState): DeviceConnectionStateText => {
  switch (connectionState) {
    case DeviceConnectionState.DEVICE_CONNECTION_STATE_DISCONNECTED:
      return DeviceConnectionStateText.DISCONNECTED;
    case DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED:
      return DeviceConnectionStateText.CONNECTED;
    default:
      return DeviceConnectionStateText.UNKNOWN;
  }
};

export const pipelineStatusText: { [key in PIPELINE_STATUS]: string } = {
  [PIPELINE_STATUS.WAITING]: 'Waiting',
  [PIPELINE_STATUS.WAITING_TO_START]: 'Waiting',
  [PIPELINE_STATUS.IN_PROGRESS]: 'Running',
  [PIPELINE_STATUS.CANCEL_REQUESTED]: 'Cancelling',
  [PIPELINE_STATUS.SUCCESS]: 'Success',
  [PIPELINE_STATUS.FAILURE]: 'Failure',
  [PIPELINE_STATUS.CANCELLED]: 'Cancelled',
  [PIPELINE_STATUS.SKIPPED]: 'Skipped',
  [PIPELINE_STATUS.UNSPECIFIED]: 'Uknown',
};

export const pipelineStatusColor: { [key in PIPELINE_STATUS]: string } = {
  [PIPELINE_STATUS.WAITING]: '#fcba03',
  [PIPELINE_STATUS.WAITING_TO_START]: '#fcba03',
  [PIPELINE_STATUS.IN_PROGRESS]: '#6499f5',
  [PIPELINE_STATUS.CANCEL_REQUESTED]: '#888888',
  [PIPELINE_STATUS.SUCCESS]: '#5cb85c',
  [PIPELINE_STATUS.FAILURE]: '#e34646',
  [PIPELINE_STATUS.CANCELLED]: '#888888',
  [PIPELINE_STATUS.SKIPPED]: '#bbbbbb',
  [PIPELINE_STATUS.UNSPECIFIED]: '#000',
};

export const remoteStatusColor: { [key in REMOTE_DEVICE_JOB_STATE]: string } = {
  [REMOTE_DEVICE_JOB_STATE.WAITING]: '#fcba03',
  [REMOTE_DEVICE_JOB_STATE.IN_PROGRESS]: '#6499f5',
  [REMOTE_DEVICE_JOB_STATE.CANCEL_REQUESTED]: '#888888',
  [REMOTE_DEVICE_JOB_STATE.SUCCESS]: '#5cb85c',
  [REMOTE_DEVICE_JOB_STATE.FAILURE]: '#e34646',
  [REMOTE_DEVICE_JOB_STATE.CANCELLED]: '#888888',
  [REMOTE_DEVICE_JOB_STATE.SKIPPED]: '#bbbbbb',
  [REMOTE_DEVICE_JOB_STATE.UNSPECIFIED]: '#000',
};

export const remoteStatusText: { [key in REMOTE_DEVICE_JOB_STATE]: string } = {
  [REMOTE_DEVICE_JOB_STATE.WAITING]: 'Waiting',
  [REMOTE_DEVICE_JOB_STATE.IN_PROGRESS]: 'In progress',
  [REMOTE_DEVICE_JOB_STATE.CANCEL_REQUESTED]: 'Cancel requested',
  [REMOTE_DEVICE_JOB_STATE.SUCCESS]: 'Passed',
  [REMOTE_DEVICE_JOB_STATE.FAILURE]: 'Failed',
  [REMOTE_DEVICE_JOB_STATE.CANCELLED]: 'Cancelled',
  [REMOTE_DEVICE_JOB_STATE.SKIPPED]: 'Skipped',
  [REMOTE_DEVICE_JOB_STATE.UNSPECIFIED]: 'Unknown',
};

export const pipelineStepEmptyText: { [key in PIPELINE_STATUS]?: string } = {
  [PIPELINE_STATUS.WAITING]: "This step doesn't start yet",
  [PIPELINE_STATUS.WAITING_TO_START]: "This step doesn't start yet",
  [PIPELINE_STATUS.CANCELLED]: 'This step was cancelled',
  [PIPELINE_STATUS.CANCEL_REQUESTED]: 'This step will be cancelled',
  [PIPELINE_STATUS.SKIPPED]: 'This step was skipped',
};

export const destStatusColor: { [key in DEST_STATE]: string } = {
  [DEST_STATE.PENDING]: '#fcba03',
  [DEST_STATE.PASSED]: '#5cb85c',
  [DEST_STATE.FAILED]: '#e34646',
  [DEST_STATE.RUNNING]: '#6499f5',
  [DEST_STATE.SKIPPED]: '#bbbbbb',
  [DEST_STATE.UNSPECIFIED]: '#000',
};

export const pipelineJobEmptyText: { [key in PIPELINE_STATUS]?: string } = {
  [PIPELINE_STATUS.WAITING]: "This job doesn't start yet",
  [PIPELINE_STATUS.WAITING_TO_START]: "This job doesn't start yet",
  [PIPELINE_STATUS.CANCELLED]: 'This job was cancelled',
  [PIPELINE_STATUS.SKIPPED]: 'This job was skipped',
};

export const organizationRoleText: { [key in ORGANIZATION_ROLE]: string } = {
  [ORGANIZATION_ROLE.OWNER]: 'Owner',
  [ORGANIZATION_ROLE.ADMIN]: 'Admin',
  [ORGANIZATION_ROLE.MEMBER]: 'Member',
};

export const deviceLogLevelColor: {
  [key in DeviceLogLevel]: { backgroundColor: string; color: string };
} = {
  V: {
    backgroundColor: '#333333',
    color: '#ffffff',
  },
  I: {
    backgroundColor: '#4971f5',
    color: '#ffffff',
  },
  D: {
    backgroundColor: '#12a108',
    color: '#ffffff',
  },
  W: {
    backgroundColor: '#c9a60a',
    color: '#ffffff',
  },
  E: {
    backgroundColor: '#e33229',
    color: '#ffffff',
  },
  F: {
    backgroundColor: '#e33229',
    color: '#ffffff',
  },
  S: {
    backgroundColor: '#ffffff',
    color: '#000000',
  },
};
