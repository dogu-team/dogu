import { DeleteOutlined } from '@ant-design/icons';
import { RecordTestStepResponse } from '@dogu-private/console';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { Button } from 'antd';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/router';
import { shallow } from 'zustand/shallow';

import useRequest from '../../../hooks/useRequest';
import useEventStore from '../../../stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../../utils/antd';
import { getErrorMessageFromAxios } from '../../../utils/error';
import { deleteRecordTestStep } from '../../api/record';

interface Props {
  step: RecordTestStepResponse;
}

const DeleteStepButton = ({ step }: Props) => {
  const router = useRouter();
  const [loading, request] = useRequest(deleteRecordTestStep);
  const fireEvent = useEventStore((state) => state.fireEvent, shallow);
  const organizationId = router.query.orgId as OrganizationId;
  const projectId = router.query.pid as ProjectId;

  const handleClick = async () => {
    try {
      await request({
        organizationId,
        projectId,
        recordTestCaseId: step.recordTestCaseId,
        recordTestStepId: step.recordTestStepId,
      });
      fireEvent('onRecordStepDeleted', step);
      sendSuccessNotification('Deleted');
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(`Failed to delete step.\n${getErrorMessageFromAxios(e)}`);
      }
    }
  };

  return <Button icon={<DeleteOutlined />} danger shape="circle" loading={loading} onClick={handleClick} />;
};

export default DeleteStepButton;
