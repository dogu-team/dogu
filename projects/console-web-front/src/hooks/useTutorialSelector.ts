import { useRouter } from 'next/router';

import { TutorialSupportFramework, TutorialSupportPlatform, TutorialSupportTarget } from '../resources/tutorials';

type Param = {
  defaultFramework: TutorialSupportFramework;
  defaultPlatform: TutorialSupportPlatform;
  defaultTarget: TutorialSupportTarget;
};

const useTutorialSelector = ({ defaultFramework, defaultTarget, defaultPlatform }: Param) => {
  const router = useRouter();

  const framework = (router.query.framework as TutorialSupportFramework) || defaultFramework;
  const platform = (router.query.platform as TutorialSupportPlatform) || defaultPlatform;
  const target = (router.query.target as TutorialSupportTarget) || defaultTarget;

  return {
    framework,
    platform,
    target,
  };
};

export default useTutorialSelector;
