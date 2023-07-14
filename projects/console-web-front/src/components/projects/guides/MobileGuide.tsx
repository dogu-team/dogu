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
import GuideLayout from './GuideLayout';
import GuideStep from './GuideStep';
import DoneStep from './DoneStep';

const DEVICE_FARM_ID = 'device-farm';
const PROJECT_SETUP_ID = 'project-setup';
const INSTALL_DEPENDENCIES_ID = 'install-dependencies';
const SET_CAPABILITIES_ID = 'set-capabilities';
const UPLOAD_SAMPLE_APP_ID = 'upload-sample-app';
const RUN_TEST_ID = 'run-test';
const DONE_ID = 'done';

const MobileGuide = () => {
  const router = useRouter();
  const languageQuery = router.query.language as GuideSupportLanguage | undefined;
  const [language, setLanguage] = useState<GuideSupportLanguage>(
    !!languageQuery && mobileGuideData.map((item) => item.language).includes(languageQuery) ? languageQuery : mobileGuideData[0].language,
  );
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
    <GuideLayout
      sidebar={
        <div>
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
              { id: DEVICE_FARM_ID, title: 'Setup device farm' },
              { id: PROJECT_SETUP_ID, title: 'Sample project setup' },
              { id: INSTALL_DEPENDENCIES_ID, title: 'Install dependencies' },
              { id: SET_CAPABILITIES_ID, title: 'Set capabilities' },
              { id: UPLOAD_SAMPLE_APP_ID, title: 'Upload sample application' },
              { id: RUN_TEST_ID, title: 'Run remote testing' },
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
                <CopyButtonContainer language="bash" code={selectedLanguageData?.cd ?? ''} />
              </>
            }
          />
          <GuideStep
            id={INSTALL_DEPENDENCIES_ID}
            title="Install dependencies"
            description={<p>Install external packages</p>}
            content={<CopyButtonContainer language="bash" code={selectedLanguageData?.installDependencies ?? ''} />}
          />
          <GuideStep
            id={SET_CAPABILITIES_ID}
            title="Set capabilities"
            description={
              <>
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
              </>
            }
            content={<CopyButtonContainer language={language} code={capabilityCode} />}
          />
          <GuideStep
            id={UPLOAD_SAMPLE_APP_ID}
            title="Upload sample application"
            description={<p>Before starting, upload the app that matches the version specified in the script.</p>}
            content={
              <Button type="primary" onClick={handleUploadSample} loading={loading} icon={<UploadOutlined />}>
                Click here for upload
              </Button>
            }
          />
          <GuideStep
            id={RUN_TEST_ID}
            title="Run remote testing"
            description={<p>Start automated testing using sample app and script</p>}
            content={<CopyButtonContainer language="bash" code={selectedLanguageData?.runCommand ?? ''} />}
          />

          <div style={{ marginBottom: '2rem' }}>
            <GuideBanner docsUrl="https://docs.dogutech.io/test-automation/mobile/appium" />
          </div>

          <DoneStep id={DONE_ID} />
        </div>
      }
    />
  );
};

export default MobileGuide;

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
