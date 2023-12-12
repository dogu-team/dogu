import { QuestionCircleFilled } from '@ant-design/icons';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { Button, Modal } from 'antd';
import { isAxiosError } from 'axios';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import { regenerateProjectAccessToken } from '../../api/project';
import useRequest from '../../hooks/useRequest';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessageFromAxios } from '../../utils/error';
import TokenCopyInput from '../common/TokenCopyInput';

interface Props {
  isOpen: boolean;
  close: () => void;
  organizationId: OrganizationId;
  projectId: ProjectId;
}

const ProjectAccessTokenModal: React.FC<Props> = ({ isOpen, close, organizationId, projectId }) => {
  const { data, isLoading, mutate } = useSWR<string>(
    isOpen && `/organizations/${organizationId}/projects/${projectId}/access-token`,
    swrAuthFetcher,
    {
      revalidateOnFocus: false,
    },
  );
  const [loading, requestRegenerateToken] = useRequest(regenerateProjectAccessToken);

  const handleClickRegenerateToken = async () => {
    try {
      await requestRegenerateToken(organizationId, projectId);
      mutate();
      sendSuccessNotification('Successfully regenerated token.');
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(`Failed to regenerate token.\n${getErrorMessageFromAxios(e)}`);
      }
    }
  };

  return (
    <Modal
      open={isOpen}
      centered
      title={
        <>
          Project access token{' '}
          <a
            target="_blank"
            style={{ color: 'black' }}
            href="https://docs.dogutech.io/management/project/settings#access-token"
          >
            <QuestionCircleFilled />
          </a>
        </>
      }
      closable
      onCancel={close}
      footer={null}
      destroyOnClose
    >
      <TokenCopyInput value={data ?? 'Loading...'} />

      <div style={{ marginTop: '1rem' }}>
        <Button danger loading={loading} onClick={handleClickRegenerateToken}>
          Regenerate token
        </Button>
      </div>
    </Modal>
  );
};

export default ProjectAccessTokenModal;
