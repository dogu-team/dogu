import { useRouter } from 'next/router';

import TutorialButton from '../buttons/TutorialButton';

import { TUTORIAL_HOST_SESSION_KEY, TUTORIAL_PROJECT_SESSION_KEY } from '../tutorial/DeviceFarmTutorial';

const DeviceFarmTutorialLinkButton = () => {
  const router = useRouter();

  return (
    <TutorialButton
      href={`/dashboard/${router.query.orgId}/get-started`}
      onClick={() => {
        sessionStorage.removeItem(TUTORIAL_PROJECT_SESSION_KEY);
        sessionStorage.removeItem(TUTORIAL_HOST_SESSION_KEY);
      }}
    />
  );
};

export default DeviceFarmTutorialLinkButton;
