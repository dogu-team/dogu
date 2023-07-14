import { CloseOutlined, GlobalOutlined, MobileOutlined } from '@ant-design/icons';
import { Button, Radio } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styled from 'styled-components';

import { flexRowSpaceBetweenStyle } from '../../../styles/box';
import GameGuide from './GameGuide';
import MobileGuide from './MobileGuide';
import WebGuide from './WebGuide';

enum GuideCategory {
  WEB = 'web',
  MOBILE_APP = 'mobile-app',
  GAME_APP = 'game-app',
}

const UsageGuide = () => {
  const router = useRouter();
  const [target, setTarget] = useState(router.query.target || GuideCategory.WEB);

  const options = [
    {
      label: (
        <span>
          <GlobalOutlined /> Web Testing
        </span>
      ),
      value: GuideCategory.WEB,
    },
    {
      label: (
        <span>
          <MobileOutlined /> Mobile App Testing
        </span>
      ),
      value: GuideCategory.MOBILE_APP,
    },
    {
      label: 'Game App Testing',
      value: GuideCategory.GAME_APP,
    },
  ];

  return (
    <Box>
      <Content>
        <FlexRow>
          <StyledTitle>Quick start for automated testing!</StyledTitle>&nbsp;&nbsp;
          <Link href={{ pathname: router.pathname.replace('/get-started', ''), query: router.query }} style={{ fontSize: '.8rem' }}>
            <Button icon={<CloseOutlined />} />
          </Link>
        </FlexRow>
        <Radio.Group
          options={options}
          buttonStyle="solid"
          optionType="button"
          value={target}
          onChange={(e) => {
            setTarget(e.target.value);
            router.push(`/dashboard/${router.query.orgId}/projects/${router.query.pid}/get-started?target=${e.target.value}`, undefined, { shallow: true });
          }}
        />
      </Content>

      {target === GuideCategory.WEB && <WebGuide />}
      {target === GuideCategory.MOBILE_APP && <MobileGuide />}
      {target === GuideCategory.GAME_APP && <GameGuide />}

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
  margin-bottom: 1rem;
`;

const CloseBox = styled.div`
  padding-left: calc(max(20%, 220px) + 1.5rem);
  display: flex;
`;
