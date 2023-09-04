import useTutorialSelector from '../../../hooks/useTutorialSelector';
import { tutorialSdkSupportInfo, TutorialSupportSdk } from '../../../resources/tutorials';
import GuideLayout from '../GuideLayout';
import TutorialOptionSelectors from '../TutorialOptionSelectors';

const GamiumRoutineTutorial = () => {
  const { framework, platform, target } = useTutorialSelector({
    defaultFramework: tutorialSdkSupportInfo[TutorialSupportSdk.GAMIUM].defaultOptions.framework,
    defaultPlatform: tutorialSdkSupportInfo[TutorialSupportSdk.GAMIUM].defaultOptions.platform,
    defaultTarget: tutorialSdkSupportInfo[TutorialSupportSdk.GAMIUM].defaultOptions.target,
  });

  return (
    <GuideLayout
      sidebar={
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <TutorialOptionSelectors sdk={TutorialSupportSdk.GAMIUM} selectedFramwork={framework} selectedPlatform={platform} selectedTarget={target} />
          </div>
        </div>
      }
      content={<div />}
    />
  );
};

export default GamiumRoutineTutorial;
