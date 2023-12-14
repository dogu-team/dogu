export const RECORD_PIPELINE_TABLE_NAME = 'record_pipeline';

export type RecordPipelineId = string;

export enum RECORD_PIPELINE_STATE {
  UNSPECIFIED = 0,
  WAITING = 1,
  IN_PROGRESS = 2,
  CANCEL_REQUESTED = 3,
  SUCCESS = 4,
  FAILURE = 5,
  CANCELLED = 6,
  SKIPPED = 7,
}
