import { OrganizationId } from '@dogu-private/types';
import { Button } from 'antd';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/router';

import { updateOrganizationTutorial } from '../../api/organization';
import useOrganizationTutorialContext from '../../hooks/useOrganizationTutorialContext';
import useRequest from '../../hooks/useRequest';
import { sendErrorNotification } from '../../utils/antd';

interface Props {
  children: React.ReactNode;
}

const SkipTutorialButton = ({ children }: Props) => {
  const { organization } = useOrganizationTutorialContext();
  const router = useRouter();
  const [loading, request] = useRequest(updateOrganizationTutorial);

  const handleClickSkip = async () => {
    if (!organization) {
      return;
    }

    if (organization.isTutorialCompleted) {
      router.push(`/dashboard/${organization.organizationId}`);
      return;
    }

    try {
      await request(organization.organizationId, { isTutorialCompleted: 1 });
      router.push(`/dashboard/${organization.organizationId}`);
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
