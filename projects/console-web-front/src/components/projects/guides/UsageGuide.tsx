import { CloseOutlined, MobileOutlined } from '@ant-design/icons';
import { Button, Radio } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { SiWebdriverio } from 'react-icons/si';
import styled from 'styled-components';
import resources from '../../../resources';

import { GuideSupportSdk } from '../../../resources/guide';
import { flexRowSpaceBetweenStyle } from '../../../styles/box';
import AppiumGuide from './AppiumGuide';
import GamiumGuide from './GamiumGuide';
import WebdriverIoGuide from './WebdriverIoGuide';

const UsageGuide = () => {
  const router = useRouter();
  const selectedFramework = (router.query.framework as GuideSupportSdk | undefined) ?? GuideSupportSdk.WEBDRIVERIO;

  const options = [
    {
      label: (
        <span>
          <SiWebdriverio />
          &nbsp;&nbsp;WebdriverIO
        </span>
      ),
      value: GuideSupportSdk.WEBDRIVERIO,
    },
    {
      label: (
        <span>
          <Image src={resources.icons.appium} width={16} height={16} alt="Appium" />
          &nbsp;&nbsp;Appium
        </span>
      ),
      value: GuideSupportSdk.APPIUM,
    },
  ];

  return (
    <Box>
      <Content>
        <FlexRow style={{ marginBottom: '1rem' }}>
          <StyledTitle>Quick start for automated testing!</StyledTitle>&nbsp;&nbsp;
          <Link href={{ pathname: router.pathname.replace('/get-started', ''), query: router.query }} style={{ fontSize: '.8rem' }}>
            <Button icon={<CloseOutlined />} />
          </Link>
        </FlexRow>
        <Radio.Group
          options={options}
          buttonStyle="solid"
          optionType="button"
          value={selectedFramework}
          onChange={(e) => {
            router.push(`/dashboard/${router.query.orgId}/projects/${router.query.pid}/get-started?framework=${e.target.value}`, undefined, { shallow: true });
          }}
        />
      </Content>

      {selectedFramework === GuideSupportSdk.WEBDRIVERIO && <WebdriverIoGuide />}
      {selectedFramework === GuideSupportSdk.APPIUM && <AppiumGuide />}
      {selectedFramework === GuideSupportSdk.GAMIUM && <GamiumGuide />}

      <CloseBox>
        <Link href={`/dashboard/${router.query.orgId}/projects/${router.query.pid}/routines`}>
          <Button type="link">Close tutorial</Button>
        </Link>
      </CloseBox>
    </Box>
  );
};

export default UsageGuide;

const Box = styled.div`
  line-height: 1.5;
`;

const Content = styled.div`
  margin-bottom: 2rem;
`;

const StyledTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
`;

const FlexRow = styled.div`
  ${flexRowSpaceBetweenStyle}
`;

const CloseBox = styled.div`
  padding-left: calc(max(20%, 220px) + 1.5rem);
  display: flex;
`;
