import { DEST_STATE, PIPELINE_STATUS } from '@dogu-private/types';

export const isPipelineInProgress = (status: PIPELINE_STATUS): boolean => {
  return status === PIPELINE_STATUS.WAITING || status === PIPELINE_STATUS.IN_PROGRESS;
};

export const isPipelineEmptyLogStatus = (status: PIPELINE_STATUS) => {
  return (
    status === PIPELINE_STATUS.WAITING ||
    status === PIPELINE_STATUS.CANCELLED ||
    status === PIPELINE_STATUS.SKIPPED ||
    status === PIPELINE_STATUS.CANCEL_REQUESTED
  );
};

export const isPipelineEndedWithData = (status: PIPELINE_STATUS) => {
  return status === PIPELINE_STATUS.FAILURE || status === PIPELINE_STATUS.SUCCESS;
};

export const isDestEndedWithData = (status: DEST_STATE) => {
  return status === DEST_STATE.PASSED || status === DEST_STATE.FAILED;
};
