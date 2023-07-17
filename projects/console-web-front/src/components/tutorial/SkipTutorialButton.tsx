import { OrganizationId } from '@dogu-private/types';
import { Button } from 'antd';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/router';

import { updateOrganizationTutorial } from '../../api/organization';
import useRequest from '../../hooks/useRequest';
import { sendErrorNotification } from '../../utils/antd';

interface Props {
  children: React.ReactNode;
  orgId: OrganizationId;
}

const SkipTutorialButton = ({ children, orgId }: Props) => {
  const router = useRouter();
  const [loading, request] = useRequest(updateOrganizationTutorial);

  const handleClickSkip = async () => {
    try {
      await request(orgId, { isTutorialCompleted: 1 });
      router.push(`/dashboard/${orgId}`);
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification('Failed to skip tutorial');
      }
    }
  };

  return (
    <Button type="link" loading={loading} onClick={handleClickSkip}>
      {children}
    </Button>
  );
};

export default SkipTutorialButton;
