import { Button } from 'antd';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/router';

import { IS_CLOUD } from '../../../pages/_app';
import { updateUserTutorial } from '../../api/user';
import useTutorialContext from '../../hooks/context/useTutorialContext';
import useRequest from '../../hooks/useRequest';
import { sendErrorNotification } from '../../utils/antd';

interface Props {
  children: React.ReactNode;
}

const SkipTutorialButton = ({ children }: Props) => {
  const { me, organization } = useTutorialContext();
  const router = useRouter();
  const [loading, request] = useRequest(updateUserTutorial);

  const handleClickSkip = async () => {
    if (!me || !organization) {
      return;
    }

    if (me.isTutorialCompleted) {
      // IS_CLOUD
      //   ? router.push(`/dashboard/${organization.organizationId}/projects`)
      //   : router.push(`/dashboard/${organization.organizationId}/device-farm/devices`);
      router.push(`/dashboard/${organization.organizationId}/device-farm/devices`);
      return;
    }

    try {
      await request(me.userId, { isTutorialCompleted: 1 });
      // IS_CLOUD
      //   ? router.push(`/dashboard/${organization.organizationId}/projects`)
      //   : router.push(`/dashboard/${organization.organizationId}/device-farm/devices`);
      router.push(`/dashboard/${organization.organizationId}/device-farm/devices`);
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification('Failed to skip tutorial');
      }
    }
  };

  return (
    <Button type="link" loading={loading} onClick={handleClickSkip} id="skip-tutorial">
      {children}
    </Button>
  );
};

export default SkipTutorialButton;
