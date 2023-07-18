import { useRouter } from 'next/router';
import { GuideSupportFramework, GuideSupportLanguage, GuideSupportPlatform, GuideSupportTarget } from '../resources/guide';

type Param = {
  defaultFramework: GuideSupportLanguage;
  defaultPlatform: GuideSupportPlatform;
  defaultTarget: GuideSupportTarget;
};

const useTutorialSelector = ({ defaultFramework, defaultTarget, defaultPlatform }: Param) => {
  const router = useRouter();

  const framework = (router.query.framework as GuideSupportFramework) || defaultFramework;
  const platform = (router.query.platform as GuideSupportPlatform) || defaultPlatform;
  const target = (router.query.target as GuideSupportTarget) || defaultTarget;

  return {
    framework,
    platform,
    target,
  };
};

export default useTutorialSelector;
