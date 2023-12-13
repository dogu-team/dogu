import { UploadOutlined } from '@ant-design/icons';
import { UploadSampleAppDtoBase } from '@dogu-private/console';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { Button } from 'antd';
import { isAxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';

import { uploadSampleApplication } from '../../api/project-application';
import useRequest from '../../hooks/useRequest';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessageFromAxios } from '../../utils/error';

interface Props {
  organizationId: OrganizationId;
  category: UploadSampleAppDtoBase['category'];
}

const SampleApplicationUploadButton = ({ organizationId, category }: Props) => {
  const [loading, request] = useRequest(uploadSampleApplication);
  const { t } = useTranslation('tutorial');

  const handleUploadSample = async () => {
    try {
      await request(organizationId, { category, extension: 'apk' });
      sendSuccessNotification('Successfully uploaded sample application');
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(`Failed to upload sample application\n${getErrorMessageFromAxios(e)}`);
      }
    }
  };

  return (
    <Button type="primary" onClick={handleUploadSample} loading={loading} icon={<UploadOutlined />}>
      {t('uploadSampleAppButtonTitle')}
    </Button>
  );
};

export default SampleApplicationUploadButton;
