import { Alert, Button, Select, SelectProps } from 'antd';
import { useRouter } from 'next/router';
import { isAxiosError } from 'axios';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { UploadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { GuideSupportLanguage, mobileGuideData, SAMPLE_GIT_URL } from '../../../resources/guide';
import { flexRowBaseStyle } from '../../../styles/box';
import CopyButtonContainer from './CodeWithCopyButton';
import useRequest from '../../../hooks/useRequest';
import { uploadSampleApplication } from '../../../api/project-application';
import { sendErrorNotification, sendSuccessNotification } from '../../../utils/antd';
import { getErrorMessage } from '../../../utils/error';
import GuideAnchor from './GuideAnchor';
import GuideBanner from './GuideBanner';
import DocumentCard from './DocumentCard';

const PROJECT_SETUP_ID = 'project-setup';
const INSTALL_DEPENDENCIES_ID = 'install-dependencies';
const SET_CAPABILITIES_ID = 'set-capabilities';
const UPLOAD_SAMPLE_APP_ID = 'upload-sample-app';
const RUN_TEST_ID = 'run-test';
const DONE_ID = 'done';

const MobileGuide = () => {
  const router = useRouter();
  const [language, setLanguage] = useState<GuideSupportLanguage>((router.query.language as GuideSupportLanguage | undefined) || mobileGuideData[0].language);
  const [loading, request] = useRequest(uploadSampleApplication);
  const [capabilityCode, setCapabilityCode] = useState<string>('');

  const selectedLanguageData = mobileGuideData.find((data) => data.language === language);
  const organizationId = router.query.orgId as OrganizationId;
  const projectId = router.query.pid as ProjectId;

  useEffect(() => {
    const updateCapabilityCode = async () => {
      if (!selectedLanguageData) {
        return;
      }

      const code = await selectedLanguageData?.generateCapabilitiesCode(organizationId, projectId);
      setCapabilityCode(code || '');
    };

    updateCapabilityCode();
  }, [selectedLanguageData, organizationId, projectId]);

  const languageOptions: SelectProps['options'] = mobileGuideData.map((data) => ({
    label: (
      <FlexRow style={{ textTransform: 'capitalize' }}>
        <Image src={`/resources/icons/languages/${data.language}.svg`} width={24} height={24} unoptimized alt={data.language} style={{ marginRight: '.5rem' }} />
        {data.language}
      </FlexRow>
    ),
    value: data.language,
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
    <Box>
      <StickyBox>
        <div style={{ marginBottom: '1rem' }}>
          <Select
            options={languageOptions}
            value={language}
            onChange={(value) => {
              setLanguage(value);
              router.push({ query: { ...router.query, language: value } }, undefined, { shallow: true, scroll: true });
            }}
            dropdownMatchSelectWidth={false}
            style={{ width: '100%' }}
          />
        </div>

        <GuideAnchor
          items={[
            { id: PROJECT_SETUP_ID, title: 'Sample project setup' },
            { id: INSTALL_DEPENDENCIES_ID, title: 'Install dependencies' },
            { id: SET_CAPABILITIES_ID, title: 'Set capabilities' },
            { id: UPLOAD_SAMPLE_APP_ID, title: 'Upload sample application' },
            { id: RUN_TEST_ID, title: 'Run remote testign' },
            { id: DONE_ID, title: 'Done! Next step' },
          ]}
        />
      </StickyBox>
      <GuideBox>
        <Step id={PROJECT_SETUP_ID}>
          <TextWrapper>
            <StepTitle>Sample project setup</StepTitle>
            <p>Clone example repository and move to execution directory</p>
          </TextWrapper>
          <div>
            <CopyButtonContainer language="bash" code={`git clone ${SAMPLE_GIT_URL}`} />
            <CopyButtonContainer language="bash" code={selectedLanguageData?.cd ?? ''} />
          </div>
        </Step>
        <Step id={INSTALL_DEPENDENCIES_ID}>
          <TextWrapper>
            <StepTitle>Install dependencies</StepTitle>
            <p>Install external packages</p>
          </TextWrapper>
          <div>
            <CopyButtonContainer language="bash" code={selectedLanguageData?.installDependencies ?? ''} />
          </div>
        </Step>
        <Step id={SET_CAPABILITIES_ID}>
          <TextWrapper>
            <StepTitle>Set capabilities</StepTitle>
            <p>
              Open <StyledCode>{selectedLanguageData?.sampleFilePath}</StyledCode> and configure capabilities for your project
            </p>
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
          </TextWrapper>
          <div>
            <CopyButtonContainer language={language} code={capabilityCode} />
          </div>
        </Step>
        <Step id={UPLOAD_SAMPLE_APP_ID}>
          <TextWrapper>
            <StepTitle>Upload sample APK app</StepTitle>
            <p>Before starting, upload the app that matches the version specified in the script.</p>
          </TextWrapper>
          <div>
            <Button type="primary" onClick={handleUploadSample} loading={loading} icon={<UploadOutlined />}>
              Click here for upload
            </Button>
          </div>
        </Step>
        <Step id={RUN_TEST_ID}>
          <TextWrapper>
            <StepTitle>Run remote testing</StepTitle>
            <p>Start automated testing using sample app and script</p>
          </TextWrapper>
          <div>
            <CopyButtonContainer language="bash" code={selectedLanguageData?.runCommand ?? ''} />
          </div>
        </Step>

        <Step>
          <GuideBanner docsUrl="https://docs.dogutech.io/test-automation/mobile/appium" />
        </Step>

        <Step id={DONE_ID}>
          <TextWrapper>
            <StepTitle>Done! Next step 🚀</StepTitle>
          </TextWrapper>
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <DocumentCard
                title="📝 About project"
                description="Explore features for project. ie) Git integration, App management"
                url="https://docs.dogutech.io/management/project"
              />
              <DocumentCard title="📝 About routine" description="Would you like to automate more complicate tests?" url="https://docs.dogutech.io/routine" />
              <DocumentCard title="📝 Test automation" description="More information about test automation" url="https://docs.dogutech.io/test-automation" />
              <DocumentCard title="📝 Test report" description="More information about test report" url="https://docs.dogutech.io/test-report" />
            </div>
          </div>
        </Step>
      </GuideBox>
    </Box>
  );
};

export default MobileGuide;

const Box = styled.div`
  display: flex;
`;

const StickyBox = styled.div`
  position: sticky;
  width: 20%;
  min-width: 220px;
  top: 20px;
  height: 100%;
`;

const GuideBox = styled.div`
  width: 80%;
  margin-left: 2rem;
  max-width: 1000px;
`;

const Step = styled.div`
  margin-bottom: 2rem;
`;

const TextWrapper = styled.div`
  margin-bottom: 0.5rem;
`;

const StepTitle = styled.h4`
  font-size: 1.25rem;
  font-weight: 600;
`;

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
