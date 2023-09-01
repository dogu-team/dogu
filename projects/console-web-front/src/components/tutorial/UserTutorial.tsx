import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Button, Steps, Tooltip } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import styled from 'styled-components';
import useTutorialContext from '../../hooks/useTutorialContext';

import { GuideSupportSdk, guideSupportSdkText } from '../../resources/guide';
import { flexRowBaseStyle } from '../../styles/box';
import { sendErrorNotification } from '../../utils/antd';
import DeviceFarmTutorial from './DeviceFarmTutorial';
import RemoteTestTutorial from './RemoteTestTutorial';
import SdkIcon from './SdkIcon';
import SkipTutorialButton from './SkipTutorialButton';

interface Props {
  selectedSdk: GuideSupportSdk;
}

const UserTutorial = ({ selectedSdk }: Props) => {
  const router = useRouter();
  const step = router.query.step as string;
  const { project } = useTutorialContext();

  useEffect(() => {
    if (Number(step) && Number(step) > 2) {
      router.replace({ query: { ...router.query, step: 1 } }, undefined, { shallow: true });
    }
  }, [step]);

  return (
    <Box>
      {/* <HeaderContent>
        <div>
          <div style={{ marginLeft: '-.5rem' }}>
            <Link href={{ query: { orgId: router.query.orgId } }} shallow>
              <Button icon={<ArrowLeftOutlined />} type="link">
                Back
              </Button>
            </Link>
          </div>
          <StyledTitle>
            Quick start -&nbsp;
            <SdkIcon sdk={selectedSdk} size={28} />
            &nbsp;{guideSupportSdkText[selectedSdk]}
          </StyledTitle>
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
              disabled: !project,
              onClick: () => {
                if (!project) {
                  sendErrorNotification('Create a project first');
                }
              },
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
            <Tooltip title="Create a project first" open={!project ? undefined : false}>
              <Link href={{ query: { ...router.query, step: 2 } }} shallow>
                <Button type="link" disabled={!project}>
                  Next: Setup test environment&nbsp;
                  <ArrowRightOutlined />
                </Button>
              </Link>
            </Tooltip>
          </LinkBox>
        </GuideWrapper>
      )}
      {step === '2' && (
        <GuideWrapper>
          <RemoteTestTutorial selectedSdk={selectedSdk} />

          <LinkBox>
            <Link href={{ query: { ...router.query, step: 1 } }} shallow>
              <Button type="link" icon={<ArrowLeftOutlined />}>
                Prev: Setup device farm
              </Button>
            </Link>
            <SkipTutorialButton>Close tutorial</SkipTutorialButton>
          </LinkBox>
        </GuideWrapper>
      )} */}
    </Box>
  );
};

export default UserTutorial;

const Box = styled.div`
  line-height: 1.5;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledTitle = styled.h1`
  ${flexRowBaseStyle}
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
  max-width: calc(max(20%, 220px) + 2rem + 1000px);
  padding-left: calc(max(20%, 220px) + 2rem);
`;
