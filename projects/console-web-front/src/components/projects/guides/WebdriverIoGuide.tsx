import { Button, Select, SelectProps } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { OrganizationId, ProjectId } from '@dogu-private/types';

import DoneStep from './DoneStep';
import GuideAnchor from './GuideAnchor';
import GuideLayout from './GuideLayout';
import GuideStep from './GuideStep';
import CopyButtonContainer from './CodeWithCopyButton';
import {
  GuideSupportLanguage,
  guideSupportLanguageText,
  GuideSupportPlatform,
  guideSupportPlatformText,
  GuideSupportTarget,
  guideSupportTargetText,
  SAMPLE_GIT_URL,
  webdriverioGuideData,
} from '../../../resources/guide';
import { flexRowBaseStyle } from '../../../styles/box';
import GuideBanner from './GuideBanner';
import GuidePlatformIcon from './GuidePlatformIcon';
import GuideTargetIcon from './GuideTargetIcon';
import GuideSelectors from './GuideSelectors';
import useTutorialSelector from '../../../hooks/useTutorialSelector';

const PROJECT_SETUP_ID = 'project-setup';
const INSTALL_DEPENDENCIES_ID = 'install-dependencies';
const SET_CAPABILITIES_ID = 'set-capabilities';
const RUN_TEST_ID = 'run-test';
const RESULT_ID = 'result';
const DONE_ID = 'done';

const WebdriverIoGuide = () => {
  const router = useRouter();
  const { framework, platform, target } = useTutorialSelector({
    defaultFramework: webdriverioGuideData.supportLanguages[0],
    defaultPlatform: webdriverioGuideData.supportPlatforms[0],
    defaultTarget: webdriverioGuideData.supportTargets[0],
  });
  const [capabilityCode, setCapabilityCode] = useState<string>('');

  const selectedGuide = webdriverioGuideData.guides.find((data) => data.framework === framework && data.target === target && data.platform === platform);
  const organizationId = router.query.orgId as OrganizationId;
  const projectId = router.query.pid as ProjectId;
  const frameworkLanguage = Object.keys(webdriverioGuideData.supportFrameworks).find((language) =>
    webdriverioGuideData.supportFrameworks[language as GuideSupportLanguage]?.includes(framework),
  );

  useEffect(() => {
    const updateCapabilityCode = async () => {
      if (!selectedGuide) {
        return;
      }

      const code = await webdriverioGuideData.generateCapabilitiesCode({
        orgId: organizationId,
        projectId,
        framework,
        platform,
        target,
      });
      setCapabilityCode(code);
    };

    updateCapabilityCode();
  }, [selectedGuide, framework, target, platform, organizationId, projectId]);

  return (
    <GuideLayout
      sidebar={
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <GuideSelectors guideData={webdriverioGuideData} selectedFramwork={framework} selectedPlatform={platform} selectedTarget={target} />
          </div>
          <GuideAnchor
            items={[
              { id: PROJECT_SETUP_ID, title: 'Sample project setup' },
              { id: INSTALL_DEPENDENCIES_ID, title: 'Install dependencies' },
              { id: SET_CAPABILITIES_ID, title: 'Set capabilities' },
              { id: RUN_TEST_ID, title: 'Run remote testing' },
              { id: RESULT_ID, title: 'Check result' },
              { id: DONE_ID, title: 'Done! Next step' },
            ]}
          />
        </div>
      }
      content={
        <div>
          <GuideStep
            id={PROJECT_SETUP_ID}
            title="Sample project setup"
            description={<p>Clone example repository and move to execution directory</p>}
            content={
              <>
                <CopyButtonContainer language="bash" code={`git clone ${SAMPLE_GIT_URL}`} />
                <CopyButtonContainer language="bash" code={selectedGuide?.cd ?? ''} />
              </>
            }
          />
          <GuideStep
            id={INSTALL_DEPENDENCIES_ID}
            title="Install dependencies"
            description={<p>Install external packages</p>}
            content={<CopyButtonContainer language="bash" code={selectedGuide?.installDependencies ?? ''} />}
          />
          <GuideStep
            id={SET_CAPABILITIES_ID}
            title="Set capabilities"
            description={
              <p>
                Open <StyledCode>{selectedGuide?.sampleFilePath}</StyledCode> and configure capabilities for your project
              </p>
            }
            content={<CopyButtonContainer language={frameworkLanguage ?? ''} code={capabilityCode} />}
          />
          <GuideStep
            id={RUN_TEST_ID}
            title="Run remote testing"
            description={<p>Start automated testing using sample app and script</p>}
            content={<CopyButtonContainer language="bash" code={selectedGuide?.runCommand ?? ''} />}
          />

          <div style={{ marginBottom: '2rem' }}>
            <GuideBanner docsUrl="https://docs.dogutech.io/test-automation/webdriverio" />
          </div>

          <GuideStep
            id={RESULT_ID}
            title="Check result"
            description={<p>Check remote testing result</p>}
            content={
              <Link href={`/dashboard/${organizationId}/projects/${projectId}/remotes`}>
                <Button>Go to result</Button>
              </Link>
            }
          />

          <DoneStep id={DONE_ID} />
        </div>
      }
    />
  );
};

export default WebdriverIoGuide;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const StyledCode = styled.code`
  font-size: 0.875rem;
  font-family: 'Fira Code', monospace;
  padding: 0.25rem;
  border-radius: 0.25rem;
  background-color: #e8e8e8;
`;
