import { USER_ID_COOKIE_NAME } from '@dogu-private/types';
import { Alert, Button } from 'antd';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Cookies from 'universal-cookie';

import useTutorialSelector from '../../hooks/useTutorialSelector';
import {
  TutorialSupportLanguage,
  TutorialSupportPlatform,
  TutorialSupportTarget,
  SAMPLE_GIT_URL,
  tutorialSdkSupportInfo,
  TutorialSupportSdk,
} from '../../resources/tutorials/index';
import { gamiumRemoteTutorialGuideData, RemoteTutorialProps } from '../../resources/tutorials/remote';
import CodeWithCopyButton from '../common/CodeWithCopyButton';
import ProjectApplicationUploadButton from '../project-application/ProjectApplicationUploadButton';
import DoneStep from './DoneStep';
import GuideAnchor from './GuideAnchor';
import GuideBanner from './GuideBanner';
import GuideLayout from './GuideLayout';
import GuideStep from './GuideStep';
import PythonVirtualEnvShell from './PythonVirtualEnvShell';
import RemoteTestOptionSelectors from './RemoteTestOptionSelectors';
import RemoteTestResultList from './RemoteTestResultList';
import SampleApplicationUploadButton from './SampleApplicationUploadButton';

const PROJECT_SETUP_ID = 'project-setup';
const INSTALL_DEPENDENCIES_ID = 'install-dependencies';
const SET_CAPABILITIES_ID = 'set-capabilities';
const UPLOAD_SAMPLE_APP_ID = 'upload-sample-app';
const RUN_TEST_ID = 'run-test';
const RESULT_ID = 'result';
const DONE_ID = 'done';

const GamiumRemoteTutorial = ({ organizationId, projectId }: RemoteTutorialProps) => {
  const { framework, platform, target } = useTutorialSelector({
    defaultFramework: gamiumRemoteTutorialGuideData.defaultOptions.framework,
    defaultPlatform: gamiumRemoteTutorialGuideData.defaultOptions.platform,
    defaultTarget: TutorialSupportTarget.UNITY,
  });
  const [capabilityCode, setCapabilityCode] = useState<string>('');

  const selectedGuide = gamiumRemoteTutorialGuideData.guides.find((data) => data.framework === framework && data.target === target && data.platform === platform);
  const frameworkLanguage = Object.keys(tutorialSdkSupportInfo[TutorialSupportSdk.GAMIUM].frameworksPerLang).find((language) =>
    tutorialSdkSupportInfo[TutorialSupportSdk.GAMIUM].frameworksPerLang[language as TutorialSupportLanguage]?.includes(framework),
  );

  useEffect(() => {
    const updateCapabilityCode = async () => {
      if (!selectedGuide) {
        return;
      }

      const code = await gamiumRemoteTutorialGuideData.generateCapabilitiesCode({
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
            <RemoteTestOptionSelectors sdk={TutorialSupportSdk.GAMIUM} selectedFramwork={framework} selectedPlatform={platform} selectedTarget={target} />
          </div>

          <GuideAnchor
            items={[
              { id: PROJECT_SETUP_ID, title: 'Sample project setup' },
              { id: INSTALL_DEPENDENCIES_ID, title: 'Install dependencies' },
              { id: SET_CAPABILITIES_ID, title: 'Set capabilities' },
              { id: UPLOAD_SAMPLE_APP_ID, title: 'Upload sample application' },
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
            id={UPLOAD_SAMPLE_APP_ID}
            title="Upload sample application"
            description={<p>Before starting, upload the app that matches the version specified in the script.</p>}
            content={
              selectedGuide?.hasSampleApp ? (
                <SampleApplicationUploadButton organizationId={organizationId} projectId={projectId} category="game" />
              ) : (
                <>
                  {platform === TutorialSupportPlatform.IOS && (
                    <Alert
                      style={{ marginTop: '.5rem' }}
                      message="For iOS, we don't provide sample app. Please upload your app manually."
                      type="warning"
                      showIcon
                      action={<ProjectApplicationUploadButton organizationId={organizationId} projectId={projectId} />}
                    />
                  )}
                </>
              )
            }
          />
          <GuideStep
            id={RUN_TEST_ID}
            title="Run remote testing"
            description={<p>Start automated testing using sample app and script</p>}
            content={
              target === TutorialSupportTarget.APP && platform === TutorialSupportPlatform.IOS ? (
                <Alert message="We don't provide sample test script for iOS. Please run test with your own configuration." showIcon type="warning" />
              ) : (
                <>
                  <CodeWithCopyButton language="bash" code={selectedGuide?.runCommand ?? ''} />
                  {frameworkLanguage === TutorialSupportLanguage.PYTHON && (
                    <Alert message="If test failed with an import error, please activate virtual environment again." type="info" showIcon />
                  )}
                </>
              )
            }
          />
          <div style={{ marginBottom: '2rem' }}>
            <GuideBanner docsUrl="https://docs.dogutech.io/test-automation/gamium" />
          </div>

          <GuideStep id={RESULT_ID} title="Check result" description={<p>Check remote testing result</p>} content={<RemoteTestResultList />} />
          <DoneStep id={DONE_ID} />
        </div>
      }
    />
  );
};

export default GamiumRemoteTutorial;

const StyledCode = styled.code`
  font-size: 0.875rem;
  font-family: 'Fira Code', monospace;
  padding: 0.25rem;
  border-radius: 0.25rem;
  background-color: #e8e8e8;
`;
