import useTutorialSelector from '../../../hooks/useTutorialSelector';
import { tutorialSdkSupportInfo, TutorialSupportSdk } from '../../../resources/tutorials';
import GuideLayout from '../GuideLayout';
import TutorialOptionSelectors from '../TutorialOptionSelectors';

const SeleniumRoutineTutorial = () => {
  const { framework, platform, target } = useTutorialSelector({
    defaultFramework: tutorialSdkSupportInfo[TutorialSupportSdk.SELENIUM].defaultOptions.framework,
    defaultPlatform: tutorialSdkSupportInfo[TutorialSupportSdk.SELENIUM].defaultOptions.platform,
    defaultTarget: tutorialSdkSupportInfo[TutorialSupportSdk.SELENIUM].defaultOptions.target,
  });

  return (
    <GuideLayout
      sidebar={
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <TutorialOptionSelectors sdk={TutorialSupportSdk.SELENIUM} selectedFramwork={framework} selectedPlatform={platform} selectedTarget={target} />
          </div>
        </div>
      }
      content={<div />}
    />
  );
};

export default SeleniumRoutineTutorial;
