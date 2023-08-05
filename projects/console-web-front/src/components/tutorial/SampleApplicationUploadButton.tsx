import { UploadOutlined } from '@ant-design/icons';
import { UploadSampleAppDtoBase } from '@dogu-private/console';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { Button } from 'antd';
import { isAxiosError } from 'axios';

import { uploadSampleApplication } from '../../api/project-application';
import useRequest from '../../hooks/useRequest';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessage } from '../../utils/error';

interface Props {
  organizationId: OrganizationId;
  projectId: ProjectId;
  category: UploadSampleAppDtoBase['category'];
}

const SampleApplicationUploadButton = ({ organizationId, projectId, category }: Props) => {
  const [loading, request] = useRequest(uploadSampleApplication);

  const handleUploadSample = async () => {
    try {
      await request(organizationId, projectId, { category, extension: 'apk' });
      sendSuccessNotification('Successfully uploaded sample application');
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(`Failed to upload sample application\n${getErrorMessage(e)}`);
      }
    }
  };

  return (
    <Button type="primary" onClick={handleUploadSample} loading={loading} icon={<UploadOutlined />}>
      Click here for upload
    </Button>
  );
};

export default SampleApplicationUploadButton;
