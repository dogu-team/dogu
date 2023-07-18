import { RemoteDeviceJobId } from '..';
import { RoutineStepId } from '../step/types';

export enum DEST_STATE {
  UNSPECIFIED = 0,
  PENDING = 1,
  RUNNING = 2,
  FAILED = 3,
  PASSED = 4,
  SKIPPED = 5,
}

const Unspecified = 'unspecified' as const;
const Pending = 'pending' as const;
const Running = 'running' as const;
const Skipped = 'skipped' as const;
const Failed = 'failed' as const;
const Passed = 'passed' as const;

export const DestPropagatableState = [Skipped] as const;
export type DestPropagatableState = (typeof DestPropagatableState)[number];
export const DestBubbleableState = [Failed, Passed] as const;
export type DestBubbleableState = (typeof DestBubbleableState)[number];
export const DestState = [Unspecified, Pending, Running, Failed, Passed, Skipped] as const;
export type DestState = (typeof DestState)[number];

export function destStatusEnumToStateString(status: DEST_STATE): DestState {
  return DestState[status];
}

export function destStateStringToStatusEnum(status: DestState): DEST_STATE {
  return DestState.indexOf(status) as DEST_STATE;
}

export function isDestCompleted(status: DEST_STATE): boolean {
  return status === DEST_STATE.FAILED || status === DEST_STATE.PASSED || status === DEST_STATE.SKIPPED;
}

export enum DEST_TYPE {
  JOB = 0,
  UNIT = 1,
}

export type DestId = number;

export interface RoutineDestPublic {
  destId: DestId;
  routineStepId: RoutineStepId;
  name: string;
  index: number;
  state: DEST_STATE;
  type: DEST_TYPE;
}

export type RemoteDestId = string;
export interface RemoteDestPublic {
  remoteDestId: RemoteDestId;
  remoteDeviceJobId: RemoteDeviceJobId;
  name: string;
  index: number;
  state: DEST_STATE;
  type: DEST_TYPE;
}
