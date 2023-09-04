import { RECORD_PIPELINE_STATE } from '@dogu-private/types';

export type RECORD_PIPELINE_STATE_KEY = keyof typeof RECORD_PIPELINE_STATE;

export function getPipelineStateKey(state: RECORD_PIPELINE_STATE): RECORD_PIPELINE_STATE_KEY {
  switch (state) {
    case RECORD_PIPELINE_STATE.UNSPECIFIED:
      return 'UNSPECIFIED';
    case RECORD_PIPELINE_STATE.WAITING:
      return 'WAITING';
    case RECORD_PIPELINE_STATE.IN_PROGRESS:
      return 'IN_PROGRESS';
    case RECORD_PIPELINE_STATE.CANCEL_REQUESTED:
      return 'CANCEL_REQUESTED';
    case RECORD_PIPELINE_STATE.SUCCESS:
      return 'SUCCESS';
    case RECORD_PIPELINE_STATE.FAILURE:
      return 'FAILURE';
    case RECORD_PIPELINE_STATE.CANCELLED:
      return 'CANCELLED';
    case RECORD_PIPELINE_STATE.SKIPPED:
      return 'SKIPPED';
    default:
      const _exaustiveCheck: never = state;
      throw new Error(`Unexpected state: ${_exaustiveCheck}`);
  }
}

export function isRecordCompleted(state: RECORD_PIPELINE_STATE): boolean {
  return (
    state === RECORD_PIPELINE_STATE.SUCCESS || //
    state === RECORD_PIPELINE_STATE.FAILURE ||
    state === RECORD_PIPELINE_STATE.CANCELLED ||
    state === RECORD_PIPELINE_STATE.SKIPPED
  );
}
