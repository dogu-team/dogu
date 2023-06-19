// import { RoutinePipelineBase } from '../../base/pipeline';

// export type PipelineResponse = RoutinePipelineBase;

export interface DestSummaryResponse {
  totalJobCount: number;
  totalUnitCount: number;
  passedJobCount: number;
  passedUnitCount: number;
  failedJobCount: number;
  failedUnitCount: number;
  skippedJobCount: number;
  skippedUnitCount: number;
  pendingJobCount: number;
  pendingUnitCount: number;
  unspecifiedJobCount: number;
  unspecifiedUnitCount: number;
}
