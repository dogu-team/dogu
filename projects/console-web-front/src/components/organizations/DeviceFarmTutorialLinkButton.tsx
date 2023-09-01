import { Button } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { TUTORIAL_HOST_SESSION_KEY, TUTORIAL_PROJECT_SESSION_KEY } from '../tutorial/DeviceFarmTutorial';

const DeviceFarmTutorialLinkButton = () => {
  const router = useRouter();

  return (
    <Link
      href={`/dashboard/${router.query.orgId}/get-started`}
      onClick={() => {
        sessionStorage.removeItem(TUTORIAL_PROJECT_SESSION_KEY);
        sessionStorage.removeItem(TUTORIAL_HOST_SESSION_KEY);
      }}
    >
      <Button>Tutorial</Button>
    </Link>
  );
};

export default DeviceFarmTutorialLinkButton;
