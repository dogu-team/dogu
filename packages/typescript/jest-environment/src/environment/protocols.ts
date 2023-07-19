export const DefaultRequestTimeout = 60 * 1000; // unit: milliseconds

export enum DestType {
  JOB = 0,
  UNIT = 1,
}

export enum DestState {
  UNSPECIFIED = 0,
  PENDING = 1,
  RUNNING = 2,
  FAILED = 3,
  PASSED = 4,
  SKIPPED = 5,
}

const destCompletedStates = [DestState.FAILED, DestState.PASSED, DestState.SKIPPED];

export function isDestStateCompleted(state: DestState): boolean {
  return destCompletedStates.includes(state);
}
