import { Alert, Button, Select, SelectProps } from 'antd';
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
import { GuideSupportLanguage, SAMPLE_GIT_URL, webGuideData } from '../../../resources/guide';
import { flexRowBaseStyle } from '../../../styles/box';
import GuideBanner from './GuideBanner';

const DEVICE_FARM_ID = 'device-farm';
const PROJECT_SETUP_ID = 'project-setup';
const INSTALL_DEPENDENCIES_ID = 'install-dependencies';
const SET_CAPABILITIES_ID = 'set-capabilities';
const RUN_TEST_ID = 'run-test';
const DONE_ID = 'done';

const WebGuide = () => {
  const router = useRouter();
  const languageQuery = router.query.language as GuideSupportLanguage | undefined;
  const [language, setLanguage] = useState<GuideSupportLanguage>(
    !!languageQuery && webGuideData.map((item) => item.language).includes(languageQuery) ? languageQuery : webGuideData[0].language,
  );
  const [capabilityCode, setCapabilityCode] = useState<string>('');

  const selectedLanguageData = webGuideData.find((data) => data.language === language);
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

  const languageOptions: SelectProps['options'] = webGuideData.map((data) => ({
    label: (
      <FlexRow style={{ textTransform: 'capitalize' }}>
        <Image src={`/resources/icons/languages/${data.language}.svg`} width={24} height={24} unoptimized alt={data.language} style={{ marginRight: '.5rem' }} />
        {data.language}
      </FlexRow>
    ),
    value: data.language,
  }));

  const platformOptions: SelectProps['options'] = [
    { label: 'macOS', value: 'macos' },
    { label: 'Windows', value: 'windows' },
  ];

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
              <p>
                Open <StyledCode>{selectedLanguageData?.sampleFilePath}</StyledCode> and configure capabilities for your project
              </p>
            }
            content={<CopyButtonContainer language={language} code={capabilityCode} />}
          />
          <GuideStep
            id={RUN_TEST_ID}
            title="Run remote testing"
            description={<p>Start automated testing using sample app and script</p>}
            content={<CopyButtonContainer language="bash" code={selectedLanguageData?.runCommand ?? ''} />}
          />

          <div style={{ marginBottom: '2rem' }}>
            <GuideBanner docsUrl="https://docs.dogutech.io/test-automation/browser" />
          </div>

          <DoneStep id={DONE_ID} />
        </div>
      }
    />
  );
};

export default WebGuide;

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
