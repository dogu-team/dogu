import { RoutinePipelineBase, RoutineBase } from '@dogu-private/console';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { Button } from 'antd';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';

import { cancelPipeline } from '../../api/routine';
import useRequest from '../../hooks/useRequest';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessageFromAxios } from '../../utils/error';

interface Props {
  pipeline: RoutinePipelineBase;
}

const CancelPipelineButton = ({ pipeline }: Props) => {
  const router = useRouter();
  const [loading, request] = useRequest(cancelPipeline);
  const orgId = router.query.orgId;
  const projectId = router.query.pid;

  const handleClick = async () => {
    try {
      await request(orgId as OrganizationId, projectId as ProjectId, pipeline.routinePipelineId);
      sendSuccessNotification('Cancelled!');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(`Failed to cancel\n${getErrorMessageFromAxios(e)}`);
      }
    }
  };

  return (
    <Button danger loading={loading} onClick={handleClick}>
      Cancel pipeline
    </Button>
  );
};

export default CancelPipelineButton;
