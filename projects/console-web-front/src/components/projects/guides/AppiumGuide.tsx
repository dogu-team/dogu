import { Alert, Button, Select, SelectProps } from 'antd';
import { useRouter } from 'next/router';
import { isAxiosError } from 'axios';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { UploadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import {
  appiumGuideData,
  GuideSupportLanguage,
  guideSupportLanguageText,
  GuideSupportPlatform,
  guideSupportPlatformText,
  GuideSupportTarget,
  guideSupportTargetText,
  SAMPLE_GIT_URL,
} from '../../../resources/guide';
import { flexRowBaseStyle } from '../../../styles/box';
import CopyButtonContainer from './CodeWithCopyButton';
import useRequest from '../../../hooks/useRequest';
import { uploadSampleApplication } from '../../../api/project-application';
import { sendErrorNotification, sendSuccessNotification } from '../../../utils/antd';
import { getErrorMessage } from '../../../utils/error';
import GuideAnchor from './GuideAnchor';
import GuideBanner from './GuideBanner';
import GuideLayout from './GuideLayout';
import GuideStep from './GuideStep';
import DoneStep from './DoneStep';
import ProjectApplicationUploadButton from '../../project-application/ProjectApplicationUploadButton';
import GuidePlatformIcon from './GuidePlatformIcon';
import GuideTargetIcon from './GuideTargetIcon';

const DEVICE_FARM_ID = 'device-farm';
const PROJECT_SETUP_ID = 'project-setup';
const INSTALL_DEPENDENCIES_ID = 'install-dependencies';
const SET_CAPABILITIES_ID = 'set-capabilities';
const UPLOAD_SAMPLE_APP_ID = 'upload-sample-app';
const RUN_TEST_ID = 'run-test';
const RESULT_ID = 'result';
const DONE_ID = 'done';

const AppiumGuide = () => {
  const router = useRouter();
  const selectedLanguage = (router.query.language as GuideSupportLanguage | undefined) || appiumGuideData.supportLanguages[0];
  const selectedPlatform = (router.query.platform as GuideSupportPlatform | undefined) || appiumGuideData.supportPlatforms[0];
  const selectedTarget = (router.query.target as GuideSupportTarget | undefined) || appiumGuideData.supportTargets[0];
  const [loading, request] = useRequest(uploadSampleApplication);
  const [capabilityCode, setCapabilityCode] = useState<string>('');

  const selectedGuide = appiumGuideData.guides.find((data) => data.language === selectedLanguage && data.target === selectedTarget && data.platform === selectedPlatform);
  const organizationId = router.query.orgId as OrganizationId;
  const projectId = router.query.pid as ProjectId;

  useEffect(() => {
    const updateCapabilityCode = async () => {
      if (!selectedGuide) {
        return;
      }

      const code = await appiumGuideData.generateCapabilitiesCode({
        orgId: organizationId,
        projectId,
        language: selectedLanguage,
        platform: selectedPlatform,
        target: selectedTarget,
      });
      setCapabilityCode(code);
    };

    updateCapabilityCode();
  }, [selectedGuide, selectedLanguage, selectedTarget, selectedPlatform, organizationId, projectId]);

  const languageOptions: SelectProps['options'] = appiumGuideData.supportLanguages.map((language) => ({
    label: (
      <FlexRow>
        <Image src={`/resources/icons/languages/${language}.svg`} width={20} height={20} unoptimized alt={language} style={{ marginRight: '.5rem' }} />
        {guideSupportLanguageText[language]}
      </FlexRow>
    ),
    value: language,
  }));

  const platformOptions: SelectProps['options'] = appiumGuideData.supportPlatforms.map((platform) => ({
    label: (
      <FlexRow>
        <GuidePlatformIcon platform={platform} />
        &nbsp;&nbsp;
        {guideSupportPlatformText[platform]}
      </FlexRow>
    ),
    value: platform,
  }));

  const targetOptions: SelectProps['options'] = appiumGuideData.supportTargets.map((target) => ({
    label: (
      <FlexRow>
        <GuideTargetIcon target={target} />
        &nbsp;&nbsp;
        {guideSupportTargetText[target]}
      </FlexRow>
    ),
    value: target,
  }));

  const handleUploadSample = async () => {
    try {
      await request(organizationId, projectId, { category: 'mobile', extension: 'apk' });
      sendSuccessNotification('Successfully uploaded sample application');
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(`Failed to upload sample application\n${getErrorMessage(e)}`);
      }
    }
  };

  return (
    <GuideLayout
      sidebar={
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <Select
              options={languageOptions}
              value={selectedLanguage}
              onChange={(value) => {
                router.push({ query: { ...router.query, language: value } }, undefined, { shallow: true, scroll: true });
              }}
              dropdownMatchSelectWidth={false}
              style={{ width: '100%', marginBottom: '.5rem' }}
            />
            <Select
              options={platformOptions}
              value={selectedPlatform}
              onChange={(value) => {
                router.push({ query: { ...router.query, platform: value } }, undefined, { shallow: true, scroll: true });
              }}
              dropdownMatchSelectWidth={false}
              style={{ width: '100%', marginBottom: '.5rem' }}
            />
            <Select
              options={targetOptions}
              value={selectedTarget}
              onChange={(value) => {
                router.push({ query: { ...router.query, target: value } }, undefined, { shallow: true, scroll: true });
              }}
              dropdownMatchSelectWidth={false}
              style={{ width: '100%' }}
            />
          </div>

          <GuideAnchor
            items={[
              { id: DEVICE_FARM_ID, title: 'Setup device farm' },
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
                {selectedPlatform === GuideSupportPlatform.IOS && (
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
            content={<CopyButtonContainer language={selectedLanguage} code={capabilityCode} />}
          />
          <GuideStep
            id={UPLOAD_SAMPLE_APP_ID}
            title="Upload sample application"
            description={<p>Before starting, upload the app that matches the version specified in the script.</p>}
            content={
              selectedGuide?.hasSampleApp ? (
                <Button type="primary" onClick={handleUploadSample} loading={loading} icon={<UploadOutlined />}>
                  Click here for upload
                </Button>
              ) : (
                <>
                  {selectedPlatform === GuideSupportPlatform.IOS && (
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
            content={<CopyButtonContainer language="bash" code={selectedGuide?.runCommand ?? ''} />}
          />

          <div style={{ marginBottom: '2rem' }}>
            <GuideBanner docsUrl="https://docs.dogutech.io/test-automation/mobile/appium" />
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
