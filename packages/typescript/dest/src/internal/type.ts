export type JobStatistic = {
  totalJob: number;
  totalTest: number;

  failedJob: number;
  failedTest: number;

  passedJob: number;
  passedTest: number;

  skippedJob: number;
  skippedTest: number;

  pendingJob: number;
  pendingTest: number;
};
