import { CloseOutlined, GithubOutlined, SlackOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import useAuth from '../../hooks/useAuth';
import { flexRowBaseStyle, flexRowCenteredStyle } from '../../styles/box';
import AccountMenu from '../AccountMenu';
import ChangeLogButton from '../change-logs/ChangeLogButton';
import DoguText from '../common/DoguText';

import Header from './Header';

interface Props {
  children: React.ReactNode;
}

const ConsoleBasicLayout = ({ children }: Props) => {
  const { me, isLoading, error, mutate } = useAuth();
  const router = useRouter();
  const [isBannerVisible, setIsBannerVisible] = useState(() => localStorage.getItem('hideHeaderBanner') !== 'true');

  if (isLoading) {
    return null;
  }

  if (!me || error) {
    if (!me) {
      router.push(`/signin?redirect=${router.asPath}`);
      return null;
    }

    router.push(`/account/organizations`);
    return null;
  }

  return (
    <>
      <Box>
        {isBannerVisible && (
          <AlertBanner>
            <DoguText /> is now in ✨Beta. Please feel free to report any bugs or feedback to{' '}
            <a href="https://join.slack.com/t/dogu-community/shared_invite/zt-1zespy16o-TgYIureSBI6ma6o_nG3gVw">Slack Community</a>!
            <CloseAlertButton
              onClick={() => {
                localStorage.setItem('hideHeaderBanner', 'true');
                setIsBannerVisible(false);
              }}
            >
              <CloseOutlined />
            </CloseAlertButton>
          </AlertBanner>
        )}
        <Header
          right={
            <FlexRow>
              <StyledLink href={`https://github.com/dogu-team/dogu`} target="_blank">
                <GithubOutlined />
              </StyledLink>
              <Tooltip title="Community" arrow={false} overlayInnerStyle={{ fontSize: '.8rem' }} style={{ minHeight: '0' }}>
                <StyledLink href={`https://join.slack.com/t/dogu-community/shared_invite/zt-1zespy16o-TgYIureSBI6ma6o_nG3gVw`} target="_blank">
                  <SlackOutlined />
                </StyledLink>
              </Tooltip>
              <ChangeLogButton me={me} mutateMe={mutate} />
              <AccountMenu />
            </FlexRow>
          }
        />
        {children}
      </Box>
    </>
  );
};

export default ConsoleBasicLayout;

const Box = styled.div`
  min-height: 100dvh;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const StyledLink = styled(Link)`
  ${flexRowCenteredStyle}
  width: 2rem;
  height: 2rem;
  margin-right: 0.75rem;
  border-radius: 50%;
  color: #000;
  font-size: 1.2rem;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const AlertBanner = styled.div`
  padding: 0.25rem 2rem;
  font-size: 0.85rem;
  background-color: ${(props) => props.theme.main.colors.blue6};
  line-height: 1.5;
  text-align: center;
`;

const CloseAlertButton = styled.button`
  position: absolute;
  padding: 0 0.25rem;
  right: 2rem;
  border-radius: 4px;
  background-color: transparent;

  &:hover {
    background-color: ${(props) => props.theme.main.colors.gray6};
  }
`;
