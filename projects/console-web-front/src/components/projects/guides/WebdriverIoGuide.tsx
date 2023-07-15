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

const DEVICE_FARM_ID = 'device-farm';
const PROJECT_SETUP_ID = 'project-setup';
const INSTALL_DEPENDENCIES_ID = 'install-dependencies';
const SET_CAPABILITIES_ID = 'set-capabilities';
const RUN_TEST_ID = 'run-test';
const RESULT_ID = 'result';
const DONE_ID = 'done';

const WebdriverIoGuide = () => {
  const router = useRouter();
  const selectedLanguage = (router.query.language as GuideSupportLanguage | undefined) || webdriverioGuideData.supportLanguages[0];
  const selectedPlatform = (router.query.platform as GuideSupportPlatform | undefined) || webdriverioGuideData.supportPlatforms[0];
  const selectedTarget = (router.query.target as GuideSupportTarget | undefined) || webdriverioGuideData.supportTargets[0];
  const [capabilityCode, setCapabilityCode] = useState<string>('');

  const selectedGuide = webdriverioGuideData.guides.find((data) => data.language === selectedLanguage && data.target === selectedTarget && data.platform === selectedPlatform);
  const organizationId = router.query.orgId as OrganizationId;
  const projectId = router.query.pid as ProjectId;

  useEffect(() => {
    if (!selectedGuide) {
      const fallbackGuide = webdriverioGuideData.guides.find((guide) => guide.language === selectedLanguage && guide.platform === selectedPlatform);

      router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          language: fallbackGuide?.language,
          platform: fallbackGuide?.platform,
          target: fallbackGuide?.target,
        },
      });
    }
  }, [selectedGuide, selectedLanguage, selectedPlatform]);

  useEffect(() => {
    const updateCapabilityCode = async () => {
      if (!selectedGuide) {
        return;
      }

      const code = await webdriverioGuideData.generateCapabilitiesCode({
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

  const languageOptions: SelectProps['options'] = webdriverioGuideData.supportLanguages.map((language) => ({
    label: (
      <FlexRow>
        <Image src={`/resources/icons/languages/${language}.svg`} width={20} height={20} unoptimized alt={language} style={{ marginRight: '.5rem' }} />
        {guideSupportLanguageText[language]}
      </FlexRow>
    ),
    value: language,
  }));

  const platformOptions: SelectProps['options'] = webdriverioGuideData.supportPlatforms.map((platform) => ({
    label: (
      <FlexRow>
        <GuidePlatformIcon platform={platform} />
        &nbsp;&nbsp;
        {guideSupportPlatformText[platform]}
      </FlexRow>
    ),
    value: platform,
  }));

  const targetOptions: SelectProps['options'] = webdriverioGuideData.supportTargets.map((target) => ({
    label: (
      <FlexRow>
        <GuideTargetIcon target={target} />
        &nbsp;&nbsp;
        {guideSupportTargetText[target]}
      </FlexRow>
    ),
    value: target,
  }));

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
              <p>
                Open <StyledCode>{selectedGuide?.sampleFilePath}</StyledCode> and configure capabilities for your project
              </p>
            }
            content={<CopyButtonContainer language={selectedLanguage} code={capabilityCode} />}
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
