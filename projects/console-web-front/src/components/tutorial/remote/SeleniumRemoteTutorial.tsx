import { Alert } from 'antd';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import { USER_ID_COOKIE_NAME } from '@dogu-private/types';

import {
  TutorialSupportLanguage,
  SAMPLE_GIT_URL,
  TutorialSupportPlatform,
  TutorialSupportTarget,
  tutorialSdkSupportInfo,
  TutorialSupportSdk,
} from '../../../resources/tutorials/index';
import { flexRowBaseStyle } from '../../../styles/box';
import GuideAnchor from '../GuideAnchor';
import GuideBanner from '../GuideBanner';
import GuideLayout from '../GuideLayout';
import GuideStep from '../GuideStep';
import DoneStep from '../DoneStep';
import useTutorialSelector from '../../../hooks/useTutorialSelector';
import TutorialOptionSelectors from '../TutorialOptionSelectors';
import CodeWithCopyButton from '../../common/CodeWithCopyButton';
import RemoteTestResultList from './RemoteTestResultList';
import PythonVirtualEnvShell from '../PythonVirtualEnvShell';
import { RemoteTutorialProps, seleniumRemoteTutorialGuideData } from '../../../resources/tutorials/remote';

const PROJECT_SETUP_ID = 'project-setup';
const INSTALL_DEPENDENCIES_ID = 'install-dependencies';
const SET_CAPABILITIES_ID = 'set-capabilities';
const RUN_TEST_ID = 'run-test';
const RESULT_ID = 'result';
const DONE_ID = 'done';

const SeleniumRemoteTutorial = ({ organizationId, projectId }: RemoteTutorialProps) => {
  const { framework, platform, target } = useTutorialSelector({
    defaultFramework: tutorialSdkSupportInfo[TutorialSupportSdk.SELENIUM].defaultOptions.framework,
    defaultPlatform: tutorialSdkSupportInfo[TutorialSupportSdk.SELENIUM].defaultOptions.platform,
    defaultTarget: tutorialSdkSupportInfo[TutorialSupportSdk.SELENIUM].defaultOptions.target,
  });
  const [capabilityCode, setCapabilityCode] = useState<string>('');

  const selectedGuide = seleniumRemoteTutorialGuideData.guides.find((data) => data.framework === framework && data.target === target && data.platform === platform);
  const frameworkLanguage = Object.keys(tutorialSdkSupportInfo[TutorialSupportSdk.SELENIUM].frameworksPerLang).find((language) =>
    tutorialSdkSupportInfo[TutorialSupportSdk.SELENIUM].frameworksPerLang[language as TutorialSupportLanguage]?.includes(framework),
  );

  useEffect(() => {
    const updateCapabilityCode = async () => {
      if (!selectedGuide) {
        return;
      }

      const code = await seleniumRemoteTutorialGuideData.generateCapabilitiesCode({
        orgId: organizationId,
        projectId,
        framework,
        platform,
        target,
        userId: new Cookies().get(USER_ID_COOKIE_NAME),
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
            <TutorialOptionSelectors sdk={TutorialSupportSdk.SELENIUM} selectedFramwork={framework} selectedPlatform={platform} selectedTarget={target} />
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
                <CodeWithCopyButton language="bash" code={`git clone ${SAMPLE_GIT_URL}`} />
                <CodeWithCopyButton language="bash" code={selectedGuide?.cd ?? ''} />
                {frameworkLanguage === TutorialSupportLanguage.PYTHON && (
                  <div style={{ marginTop: '.5rem' }}>
                    <p>And, setup virtual environment</p>
                    <PythonVirtualEnvShell />
                  </div>
                )}
              </>
            }
          />
          <GuideStep
            id={INSTALL_DEPENDENCIES_ID}
            title="Install dependencies"
            description={<p>Install external packages</p>}
            content={<CodeWithCopyButton language="bash" code={selectedGuide?.installDependencies ?? ''} />}
          />
          <GuideStep
            id={SET_CAPABILITIES_ID}
            title="Set capabilities"
            description={
              <p>
                Open <StyledCode>dogu.config.json</StyledCode> and configure capabilities for your project
              </p>
            }
            content={<CodeWithCopyButton language={'json'} code={capabilityCode} />}
          />
          <GuideStep
            id={RUN_TEST_ID}
            title="Run remote testing"
            description={<p>Start automated testing using sample app and script</p>}
            content={
              <>
                {platform === TutorialSupportPlatform.MACOS && (
                  <Alert
                    message={
                      <p>
                        For Safari in macOS, please run <CodeWithCopyButton language="bash" code="sudo /usr/bin/safaridriver --enable" /> for testing.
                      </p>
                    }
                  />
                )}
                <CodeWithCopyButton language="bash" code={selectedGuide?.runCommand ?? ''} />
                {frameworkLanguage === TutorialSupportLanguage.PYTHON && (
                  <Alert message="If test failed with an import error, please activate virtual environment again." type="info" showIcon />
                )}
              </>
            }
          />

          <div style={{ marginBottom: '2rem' }}>
            <GuideBanner docsUrl="https://docs.dogutech.io/test-automation/appium" />
          </div>

          <GuideStep id={RESULT_ID} title="Check result" description={<p>Check remote testing result</p>} content={<RemoteTestResultList />} />

          <DoneStep id={DONE_ID} />
        </div>
      }
    />
  );
};

export default SeleniumRemoteTutorial;

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
