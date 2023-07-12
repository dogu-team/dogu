import { Button, Select, SelectProps } from 'antd';
import { useRouter } from 'next/router';
import { isAxiosError } from 'axios';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { UploadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import Image from 'next/image';

import { GuideSupportLanguage, mobileGuideData, SAMPLE_GIT_URL } from '../../../resources/guide';
import { flexRowBaseStyle } from '../../../styles/box';
import CopyButtonContainer from './CopyButtonContainer';
import useRequest from '../../../hooks/useRequest';
import { uploadSampleApplication } from '../../../api/project-application';
import { sendErrorNotification, sendSuccessNotification } from '../../../utils/antd';
import { getErrorMessage } from '../../../utils/error';
import GuideAnchor from './GuideAnchor';

const PROJECT_SETUP_ID = 'project-setup';
const INSTALL_DEPENDENCIES_ID = 'install-dependencies';
const SET_CAPABILITIES_ID = 'set-capabilities';
const UPLOAD_SAMPLE_APP_ID = 'upload-sample-app';
const RUN_TEST_ID = 'run-test';

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
          ]}
        />
      </StickyBox>
      <GuideBox>
        <Step id={PROJECT_SETUP_ID}>
          <StepTitle>Sample project setup</StepTitle>
          <div>
            <p>Clone sample repository.</p>
            <div>
              <CopyButtonContainer language="bash" code={SAMPLE_GIT_URL} />
              <CopyButtonContainer language="bash" code={selectedLanguageData?.cd ?? ''} />
            </div>
          </div>
        </Step>
        <Step id={INSTALL_DEPENDENCIES_ID}>
          <StepTitle>Install dependencies</StepTitle>
          <div>
            <p>어쩌고 저쩌고....</p>
            <div>
              <CopyButtonContainer language="bash" code={selectedLanguageData?.installDependencies ?? ''} />
            </div>
          </div>
        </Step>
        <Step id={SET_CAPABILITIES_ID}>
          <StepTitle>Set capabilities</StepTitle>
          <div>
            <p>어쩌고 저쩌고....</p>
            <div>
              <CopyButtonContainer language={language} code={capabilityCode} />
            </div>
          </div>
        </Step>
        <Step id={UPLOAD_SAMPLE_APP_ID}>
          <StepTitle>Upload sample APK app</StepTitle>
          <div>
            <p>어쩌고 저쩌고...</p>
            <div>
              <Button type="primary" onClick={handleUploadSample} loading={loading} icon={<UploadOutlined />}>
                Click for upload
              </Button>
            </div>
          </div>
        </Step>
        <Step id={RUN_TEST_ID}>
          <StepTitle>Run remote testing</StepTitle>
          <div>
            <p>Clone sample repository.</p>
            <div>
              <CopyButtonContainer language="bash" code={selectedLanguageData?.runCommand ?? ''} />
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
  margin-left: 1rem;
  max-width: 1000px;
`;

const Step = styled.div`
  margin-bottom: 2rem;
`;

const StepTitle = styled.h4`
  font-size: 1.25rem;
  font-weight: 600;
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;
