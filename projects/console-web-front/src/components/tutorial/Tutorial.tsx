import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { OrganizationId } from '@dogu-private/types';
import { Button, Divider, Steps } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

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
  const router = useRouter();
  const step = router.query.step as string;
  const orgId = router.query.orgId as OrganizationId;

  useEffect(() => {
    if (Number(step) && Number(step) > 1) {
      router.push({ query: { ...router.query, step: 0 } }, undefined, { shallow: true });
    }
  }, [step]);

  return (
    <Box>
      <HeaderContent>
        <div>
          <div style={{ marginLeft: '-.5rem' }}>
            <Link href={{ query: { orgId: router.query.orgId } }} shallow>
              <Button icon={<ArrowLeftOutlined />} type="link">
                Change SDK
              </Button>
            </Link>
          </div>
          <StyledTitle>Quick start - {guideSupportSdkText[selectedSdk]}</StyledTitle>
        </div>
        <div>
          <SkipTutorialButton orgId={orgId}>Skip tutorial</SkipTutorialButton>
        </div>
      </HeaderContent>

      <StepWrapper>
        <Steps
          type="navigation"
          size="small"
          current={Number(step) || 0}
          onChange={(current) => {
            router.push({ query: { ...router.query, step: current } }, undefined, { shallow: true });
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

      {(!step || step === '0') && (
        <GuideWrapper>
          <DeviceFarmTutorial />
          <LinkBox>
            <div />
            <Link href={{ query: { ...router.query, step: 1 } }} shallow>
              <Button type="link">
                Next: Setup test environment&nbsp;
                <ArrowRightOutlined />
              </Button>
            </Link>
          </LinkBox>
        </GuideWrapper>
      )}
      {step === '1' && (
        <GuideWrapper>
          {selectedSdk === GuideSupportSdk.WEBDRIVERIO && <WebdriverIoGuide />}
          {selectedSdk === GuideSupportSdk.APPIUM && <AppiumGuide />}
          {selectedSdk === GuideSupportSdk.GAMIUM && <GamiumGuide />}

          <LinkBox>
            <Link href={{ query: { ...router.query, step: 0 } }} shallow>
              <Button type="link" icon={<ArrowLeftOutlined />}>
                Prev: Setup device farm
              </Button>
            </Link>
            <SkipTutorialButton orgId={orgId}>Close tutorial</SkipTutorialButton>
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
