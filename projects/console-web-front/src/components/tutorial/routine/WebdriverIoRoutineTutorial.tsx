import { PROJECT_TYPE } from '@dogu-private/types';
import useTutorialContext from '../../../hooks/useTutorialContext';
import useTutorialSelector from '../../../hooks/useTutorialSelector';
import { tutorialSdkSupportInfo, TutorialSupportSdk, TutorialSupportTarget } from '../../../resources/tutorials';
import GuideLayout from '../GuideLayout';
import TutorialOptionSelectors from '../TutorialOptionSelectors';

const WebdriverIoRoutineTutorial = () => {
  const { project } = useTutorialContext();

  const getProjectTypeDefaultTarget = () => {
    switch (project?.type) {
      case PROJECT_TYPE.WEB:
        return TutorialSupportTarget.WEB;
      case PROJECT_TYPE.APP:
        return TutorialSupportTarget.APP;
      case PROJECT_TYPE.GAME:
        return TutorialSupportTarget.APP;
      default:
        return TutorialSupportTarget.APP;
    }
  };

  const { framework, platform, target } = useTutorialSelector({
    defaultFramework: tutorialSdkSupportInfo[TutorialSupportSdk.WEBDRIVERIO].defaultOptions.framework,
    defaultPlatform: tutorialSdkSupportInfo[TutorialSupportSdk.WEBDRIVERIO].defaultOptions.platform,
    defaultTarget: getProjectTypeDefaultTarget(),
  });

  return (
    <GuideLayout
      sidebar={
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <TutorialOptionSelectors sdk={TutorialSupportSdk.WEBDRIVERIO} selectedFramwork={framework} selectedPlatform={platform} selectedTarget={target} />
          </div>
        </div>
      }
      content={<div />}
    />
  );
};

export default WebdriverIoRoutineTutorial;
