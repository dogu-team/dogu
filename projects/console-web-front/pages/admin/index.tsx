import { KeyOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import ConsoleBasicLayout from '../../src/components/layouts/ConsoleBasicLayout';
import { flexRowBaseStyle } from '../../src/styles/box';
import { NextPageWithLayout } from '../_app';

const AdminPage: NextPageWithLayout = () => {
  const router = useRouter();

  return (
    <Box>
      <FlexRow style={{ justifyContent: 'space-between', padding: '1rem 0' }}>
        <StyledH1>Admin Settings</StyledH1>
        <div>
          <Link href="/">
            <Button>Exit Admin</Button>
          </Link>
        </div>
      </FlexRow>
      <FlexRow style={{ alignItems: 'flex-start' }}>
        <Sidebar>
          <MenuItem href="/admin" isSelected={router.pathname === '/admin'}>
            General
          </MenuItem>
        </Sidebar>
        <Content>
          <div>우리 가격 플랜 봐라~~~ 링크</div>
          <div>License component from enterprise...</div>
        </Content>
      </FlexRow>
    </Box>
  );
};

AdminPage.getLayout = (page) => {
  return <ConsoleBasicLayout>{page}</ConsoleBasicLayout>;
};

export default AdminPage;

const Box = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const StyledH1 = styled.h1`
  font-size: 1.5rem;
  line-height: 1.5;
  font-weight: bold;
`;

const Sidebar = styled.div`
  flex: 1;
  padding: 1rem;
  padding-left: 0;
  border-right: 1px solid #efefef;
`;

const Content = styled.div`
  flex: 4;
  padding: 1rem;
`;

const MenuItem = styled(Link)<{ isSelected: boolean }>`
  display: block;
  position: relative;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  margin-bottom: 0.25rem;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  color: #000;
  background-color: ${(props) => (props.isSelected ? `${props.theme.colorPrimary}33` : 'transparent')};
  line-height: 1.5;

  &:hover {
    background-color: ${(props) => props.theme.colorPrimary}33;
  }

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 2px;
    height: 100%;
    background-color: ${(props) => props.theme.colorPrimary};
    opacity: ${(props) => (props.isSelected ? 1 : 0)};
    transition: all 0.3s ease-in-out;
  }
`;
