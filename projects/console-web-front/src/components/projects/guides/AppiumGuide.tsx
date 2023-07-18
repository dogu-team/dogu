import { Alert, Button } from 'antd';
import { useRouter } from 'next/router';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import { appiumGuideData, GuideSupportLanguage, GuideSupportPlatform, GuideSupportTarget, SAMPLE_GIT_URL } from '../../../resources/guide';
import { flexRowBaseStyle } from '../../../styles/box';
import CopyButtonContainer from './CodeWithCopyButton';
import GuideAnchor from './GuideAnchor';
import GuideBanner from './GuideBanner';
import GuideLayout from './GuideLayout';
import GuideStep from './GuideStep';
import DoneStep from './DoneStep';
import ProjectApplicationUploadButton from '../../project-application/ProjectApplicationUploadButton';
import GuideSelectors from './GuideSelectors';
import useTutorialSelector from '../../../hooks/useTutorialSelector';
import SampleApplicationUploadButton from './SampleApplicationUploadButton';

const PROJECT_SETUP_ID = 'project-setup';
const INSTALL_DEPENDENCIES_ID = 'install-dependencies';
const SET_CAPABILITIES_ID = 'set-capabilities';
const UPLOAD_SAMPLE_APP_ID = 'upload-sample-app';
const RUN_TEST_ID = 'run-test';
const RESULT_ID = 'result';
const DONE_ID = 'done';

const AppiumGuide = () => {
  const router = useRouter();
  const { framework, platform, target } = useTutorialSelector({
    defaultFramework: appiumGuideData.defaultOptions.framework,
    defaultPlatform: appiumGuideData.defaultOptions.platform,
    defaultTarget: appiumGuideData.defaultOptions.target,
  });
  const [capabilityCode, setCapabilityCode] = useState<string>('');

  const selectedGuide = appiumGuideData.guides.find((data) => data.framework === framework && data.target === target && data.platform === platform);
  const organizationId = router.query.orgId as OrganizationId;
  const projectId = router.query.pid as ProjectId;
  const frameworkLanguage = Object.keys(appiumGuideData.supportFrameworks).find((language) =>
    appiumGuideData.supportFrameworks[language as GuideSupportLanguage]?.includes(framework),
  );

  useEffect(() => {
    const updateCapabilityCode = async () => {
      if (!selectedGuide) {
        return;
      }

      const code = await appiumGuideData.generateCapabilitiesCode({
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
            <GuideSelectors guideData={appiumGuideData} selectedFramwork={framework} selectedPlatform={platform} selectedTarget={target} />
          </div>

          <GuideAnchor
            items={[
              { id: PROJECT_SETUP_ID, title: 'Sample project setup' },
              { id: INSTALL_DEPENDENCIES_ID, title: 'Install dependencies' },
              { id: SET_CAPABILITIES_ID, title: 'Set capabilities' },
              ...(target === GuideSupportTarget.APP ? [{ id: UPLOAD_SAMPLE_APP_ID, title: 'Upload sample application' }] : []),
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
              <>
                <p>
                  Open <StyledCode>{selectedGuide?.sampleFilePath}</StyledCode> and configure capabilities for your project
                </p>
                {platform === GuideSupportPlatform.IOS && (
                  <Alert
                    style={{ marginTop: '.5rem' }}
                    message="For iOS, please refer to documentation."
                    type="info"
                    showIcon
                    action={
                      <Link href="https://docs.dogutech.io/test-automation/mobile/appium/qna" target="_blank">
                        <Button>Visit</Button>
                      </Link>
                    }
                  />
                )}
              </>
            }
            content={<CopyButtonContainer language={frameworkLanguage ?? ''} code={capabilityCode} />}
          />
          {target === GuideSupportTarget.APP && (
            <GuideStep
              id={UPLOAD_SAMPLE_APP_ID}
              title="Upload sample application"
              description={<p>Before starting, upload the app that matches the version specified in the script.</p>}
              content={
                selectedGuide?.hasSampleApp ? (
                  <SampleApplicationUploadButton organizationId={organizationId} projectId={projectId} />
                ) : (
                  <>
                    {platform === GuideSupportPlatform.IOS && (
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
            content={<CopyButtonContainer language="bash" code={selectedGuide?.runCommand ?? ''} />}
          />

          <div style={{ marginBottom: '2rem' }}>
            <GuideBanner docsUrl="https://docs.dogutech.io/test-automation/appium" />
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

export default AppiumGuide;

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
