import { Button } from 'antd';
import Link from 'next/link';

import useTutorialSelector from '../../hooks/useTutorialSelector';
import { gamiumGuideData, GuideProps } from '../../resources/guide';
import DoneStep from './DoneStep';
import GuideAnchor from './GuideAnchor';
import GuideLayout from './GuideLayout';
import GuideStep from './GuideStep';
import RemoteTestOptionSelectors from './RemoteTestOptionSelectors';

const DEVICE_FARM_ID = 'device-farm';
const TUTORIAL_DOCS_ID = 'tutorial-docs';
const DONE_ID = 'done';

const GamiumGuide = ({ organizationId, projectId }: GuideProps) => {
  const { framework, platform, target } = useTutorialSelector({
    defaultFramework: gamiumGuideData.defaultOptions.framework,
    defaultPlatform: gamiumGuideData.defaultOptions.platform,
    defaultTarget: gamiumGuideData.defaultOptions.target,
  });

  return (
    <GuideLayout
      sidebar={
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <RemoteTestOptionSelectors guideData={gamiumGuideData} selectedFramwork={framework} selectedPlatform={platform} selectedTarget={target} />
          </div>
          <GuideAnchor
            items={[
              { id: DEVICE_FARM_ID, title: 'Setup device farm' },
              { id: TUTORIAL_DOCS_ID, title: 'Tutorial document' },
              { id: DONE_ID, title: 'Done! Next step' },
            ]}
          />
        </div>
      }
      content={
        <div>
          <GuideStep
            id={DEVICE_FARM_ID}
            title="Setup device farm"
            description={<p>Follow tutorial documentation!</p>}
            content={
              <Link href="https://docs.dogutech.io/get-started/tutorials/device-farm" target="_blank">
                <Button>Device farm tutorial</Button>
              </Link>
            }
          />
          <GuideStep
            id={TUTORIAL_DOCS_ID}
            title="Tutorial document"
            description={<p>Follow the tutorial document</p>}
            content={
              <Link href="https://docs.dogutech.io/get-started/tutorials/game" target="blank">
                <Button>Visit document</Button>
              </Link>
            }
          />

          <DoneStep id={DONE_ID} />
        </div>
      }
    />
  );
};

export default GamiumGuide;
