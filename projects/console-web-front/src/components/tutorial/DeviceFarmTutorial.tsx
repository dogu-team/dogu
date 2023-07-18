import { useRouter } from 'next/router';

import useTutorialSelector from '../../hooks/useTutorialSelector';
import { GuideSupportSdk, tutorialData } from '../../resources/guide';
import GuideAnchor from '../projects/guides/GuideAnchor';
import GuideLayout from '../projects/guides/GuideLayout';
import GuideSelectors from '../projects/guides/GuideSelectors';
import GuideStep from '../projects/guides/GuideStep';

const DeviceFarmTutorial = () => {
  const router = useRouter();
  const selectedSdk = (router.query.sdk as GuideSupportSdk | undefined) || GuideSupportSdk.WEBDRIVERIO;
  const guideData = tutorialData[selectedSdk];
  const { framework, platform, target } = useTutorialSelector({
    defaultFramework: guideData.defaultOptions.framework,
    defaultPlatform: guideData.defaultOptions.platform,
    defaultTarget: guideData.defaultOptions.target,
  });

  return (
    <GuideLayout
      sidebar={
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <GuideSelectors guideData={guideData} selectedFramwork={framework} selectedPlatform={platform} selectedTarget={target} />
          </div>

          <GuideAnchor items={[]} />
        </div>
      }
      content={
        <div>
          <GuideStep id="" title="Connect host" description="Connect host..." content={<p>Follow tutorial documentation!</p>} />
          <GuideStep id="" title="Option1: use as host device" description="Host device..." content={<p>Follow tutorial documentation!</p>} />
          <GuideStep id="" title="Option2: connect mobile device" description="Device....." content={<p>Follow tutorial documentation!</p>} />
        </div>
      }
    />
  );
};

export default DeviceFarmTutorial;
