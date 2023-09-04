import { Alert } from 'antd';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import { PROJECT_TYPE, USER_ID_COOKIE_NAME } from '@dogu-private/types';

import {
  TutorialSupportLanguage,
  TutorialSupportPlatform,
  TutorialSupportTarget,
  SAMPLE_GIT_URL,
  tutorialSdkSupportInfo,
  TutorialSupportSdk,
} from '../../resources/tutorials/index';
import { appiumRemoteTutorialData, RemoteTutorialProps } from '../../resources/tutorials/remote';
import { flexRowBaseStyle } from '../../styles/box';
import GuideAnchor from './GuideAnchor';
import GuideBanner from './GuideBanner';
import GuideLayout from './GuideLayout';
import GuideStep from './GuideStep';
import DoneStep from './DoneStep';
import SampleApplicationUploadButton from './SampleApplicationUploadButton';
import useTutorialSelector from '../../hooks/useTutorialSelector';
import RemoteTestOptionSelectors from './RemoteTestOptionSelectors';
import CodeWithCopyButton from '../common/CodeWithCopyButton';
import ProjectApplicationUploadButton from '../project-application/ProjectApplicationUploadButton';
import RemoteTestResultList from './RemoteTestResultList';
import PythonVirtualEnvShell from './PythonVirtualEnvShell';
import useTutorialContext from '../../hooks/useTutorialContext';

const PROJECT_SETUP_ID = 'project-setup';
const INSTALL_DEPENDENCIES_ID = 'install-dependencies';
const SET_CAPABILITIES_ID = 'set-capabilities';
const UPLOAD_SAMPLE_APP_ID = 'upload-sample-app';
const RUN_TEST_ID = 'run-test';
const RESULT_ID = 'result';
const DONE_ID = 'done';

const AppiumRemoteTutorial = ({ organizationId, projectId }: RemoteTutorialProps) => {
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
    defaultFramework: appiumRemoteTutorialData.defaultOptions.framework,
    defaultPlatform: appiumRemoteTutorialData.defaultOptions.platform,
    defaultTarget: getProjectTypeDefaultTarget(),
  });
  const [capabilityCode, setCapabilityCode] = useState<string>('');

  const selectedGuide = appiumRemoteTutorialData.guides.find((data) => data.framework === framework && data.target === target && data.platform === platform);
  const frameworkLanguage = Object.keys(tutorialSdkSupportInfo[TutorialSupportSdk.APPIUM].frameworksPerLang).find((language) =>
    tutorialSdkSupportInfo[TutorialSupportSdk.APPIUM].frameworksPerLang[language as TutorialSupportLanguage]?.includes(framework),
  );

  useEffect(() => {
    const updateCapabilityCode = async () => {
      if (!selectedGuide) {
        return;
      }

      const code = await appiumRemoteTutorialData.generateCapabilitiesCode({
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
            <RemoteTestOptionSelectors sdk={TutorialSupportSdk.APPIUM} selectedFramwork={framework} selectedPlatform={platform} selectedTarget={target} />
          </div>

          <GuideAnchor
            items={[
              { id: PROJECT_SETUP_ID, title: 'Sample project setup' },
              { id: INSTALL_DEPENDENCIES_ID, title: 'Install dependencies' },
              { id: SET_CAPABILITIES_ID, title: 'Set capabilities' },
              ...(target === TutorialSupportTarget.APP ? [{ id: UPLOAD_SAMPLE_APP_ID, title: 'Upload sample application' }] : []),
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
          {target === TutorialSupportTarget.APP && (
            <GuideStep
              id={UPLOAD_SAMPLE_APP_ID}
              title="Upload sample application"
              description={<p>Before starting, upload the app that matches the version specified in the script.</p>}
              content={
                selectedGuide?.hasSampleApp ? (
                  <SampleApplicationUploadButton organizationId={organizationId} projectId={projectId} category="mobile" />
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
          )}
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
            <GuideBanner docsUrl="https://docs.dogutech.io/test-automation/appium" />
          </div>

          <GuideStep id={RESULT_ID} title="Check result" description={<p>Check remote testing result</p>} content={<RemoteTestResultList />} />

          <DoneStep id={DONE_ID} />
        </div>
      }
    />
  );
};

export default AppiumRemoteTutorial;

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
