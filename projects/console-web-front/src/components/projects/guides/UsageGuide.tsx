import { CloseOutlined, GlobalOutlined, MobileOutlined } from '@ant-design/icons';
import { Button, Divider, Radio } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styled from 'styled-components';
import { flexRowSpaceBetweenStyle } from '../../../styles/box';

import MobileGuide from './MobileGuide';
import WebGuide from './WebGuide';

const UsageGuide = () => {
  const router = useRouter();
  const [target, setTarget] = useState('web');

  const options = [
    {
      label: (
        <span>
          <GlobalOutlined /> Web Testing
        </span>
      ),
      value: 'web',
    },
    {
      label: (
        <span>
          <MobileOutlined /> Mobile App Testing
        </span>
      ),
      value: 'mobile-app',
    },
    {
      label: 'Game App Testing',
      value: 'game-app',
    },
  ];

  return (
    <Box>
      <Content>
        <FlexRow>
          <StyledTitle>Get started automation test!</StyledTitle>&nbsp;&nbsp;
          <Link href={{ pathname: router.pathname.replace('/get-started', ''), query: router.query }} style={{ fontSize: '.8rem' }}>
            <Button icon={<CloseOutlined />} />
          </Link>
        </FlexRow>
        <Radio.Group options={options} buttonStyle="solid" optionType="button" value={target} onChange={(e) => setTarget(e.target.value)} />
      </Content>

      <Divider />

      <div>
        <p>This tutorial is for remote testing. For run routine, please read docs...</p>
      </div>

      <Divider />

      {target === 'web' && <WebGuide />}
      {target === 'mobile-app' && <MobileGuide />}
    </Box>
  );
};

export default UsageGuide;

const Box = styled.div`
  line-height: 1.5;
`;

const Content = styled.div``;

const StyledTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
`;

const FlexRow = styled.div`
  ${flexRowSpaceBetweenStyle}
  margin-bottom: 1rem;
`;
