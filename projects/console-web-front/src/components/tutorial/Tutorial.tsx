import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { ProjectBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Button, Steps } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import styled from 'styled-components';
import useOrganizationTutorialContext from '../../hooks/useOrganizationTutorialContext';

import { GuideSupportSdk, guideSupportSdkText } from '../../resources/guide';
import AppiumGuide from '../projects/guides/AppiumGuide';
import GamiumGuide from '../projects/guides/GamiumGuide';
import WebdriverIoGuide from '../projects/guides/WebdriverIoGuide';
import DeviceFarmTutorial from './DeviceFarmTutorial';
import SkipTutorialButton from './SkipTutorialButton';

interface Props {
  selectedSdk: GuideSupportSdk;
}

const Tutorial = ({ selectedSdk }: Props) => {
  const { organization, projects } = useOrganizationTutorialContext();
  const router = useRouter();
  const step = router.query.step as string;

  useEffect(() => {
    if (Number(step) && Number(step) > 2) {
      router.replace({ query: { ...router.query, step: 1 } }, undefined, { shallow: true });
    }
  }, [step]);

  if (!organization || !projects || projects.length === 0) {
    return <div>Something went wrong... please contact us</div>;
  }

  return (
    <Box>
      <HeaderContent>
        <div>
          <div style={{ marginLeft: '-.5rem' }}>
            <Link href={{ query: { orgId: router.query.orgId } }} shallow>
              <Button icon={<ArrowLeftOutlined />} type="link">
                Back
              </Button>
            </Link>
          </div>
          <StyledTitle>Quick start - {guideSupportSdkText[selectedSdk]}</StyledTitle>
        </div>
        <div>
          <SkipTutorialButton>Skip tutorial</SkipTutorialButton>
        </div>
      </HeaderContent>

      <StepWrapper>
        <Steps
          type="navigation"
          size="small"
          current={Number(step) - 1 || 0}
          onChange={(current) => {
            router.push({ query: { ...router.query, step: current + 1 } }, undefined, { shallow: true });
          }}
          items={[
            {
              title: 'Setup device farm',
            },
            {
              title: 'Setup test environment',
            },
          ]}
        />
      </StepWrapper>

      {(!step || step === '1') && (
        <GuideWrapper>
          <DeviceFarmTutorial />
          <LinkBox>
            <div />
            <Link href={{ query: { ...router.query, step: 2 } }} shallow>
              <Button type="link">
                Next: Setup test environment&nbsp;
                <ArrowRightOutlined />
              </Button>
            </Link>
          </LinkBox>
        </GuideWrapper>
      )}
      {step === '2' && (
        <GuideWrapper>
          {selectedSdk === GuideSupportSdk.WEBDRIVERIO && <WebdriverIoGuide organizationId={organization?.organizationId} projectId={projects?.[0].projectId} />}
          {selectedSdk === GuideSupportSdk.APPIUM && <AppiumGuide organizationId={organization?.organizationId} projectId={projects?.[0].projectId} />}
          {selectedSdk === GuideSupportSdk.GAMIUM && <GamiumGuide organizationId={organization?.organizationId} projectId={projects?.[0].projectId} />}

          <LinkBox>
            <Link href={{ query: { ...router.query, step: 1 } }} shallow>
              <Button type="link" icon={<ArrowLeftOutlined />}>
                Prev: Setup device farm
              </Button>
            </Link>
            <SkipTutorialButton>Close tutorial</SkipTutorialButton>
          </LinkBox>
        </GuideWrapper>
      )}
    </Box>
  );
};

export default Tutorial;

const Box = styled.div`
  line-height: 1.5;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
`;

const StepWrapper = styled.div`
  max-width: 600px;
`;

const GuideWrapper = styled.div`
  margin-top: 1rem;
`;

const LinkBox = styled.div`
  display: flex;
  justify-content: space-between;
  padding-left: calc(max(20%, 220px) + 1.5rem);
`;
