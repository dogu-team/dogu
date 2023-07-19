import { OrganizationId } from '@dogu-private/types';
import { Button } from 'antd';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/router';
import { updateUserTutorial } from '../../api/user';

import useOrganizationTutorialContext from '../../hooks/useOrganizationTutorialContext';
import useRequest from '../../hooks/useRequest';
import { sendErrorNotification } from '../../utils/antd';

interface Props {
  children: React.ReactNode;
}

const SkipTutorialButton = ({ children }: Props) => {
  const { me, organization } = useOrganizationTutorialContext();
  const router = useRouter();
  const [loading, request] = useRequest(updateUserTutorial);

  const handleClickSkip = async () => {
    if (!me || !organization) {
      return;
    }

    if (me.isTutorialCompleted) {
      router.push(`/dashboard/${organization.organizationId}`);
      return;
    }

    try {
      await request(me.userId, { isTutorialCompleted: 1 });
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
