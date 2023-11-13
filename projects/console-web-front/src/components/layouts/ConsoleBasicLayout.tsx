import { CloseOutlined, SlackOutlined } from '@ant-design/icons';
import { CloudLicenseResponse, SelfHostedLicenseResponse, UserBase } from '@dogu-private/console';
import { Button, Tooltip } from 'antd';
import Trans from 'next-translate/Trans';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { ImPriceTag } from 'react-icons/im';
import styled from 'styled-components';
import { shallow } from 'zustand/shallow';

import LicenseTag from '../../../enterprise/components/license/LicenseTag';
import useAuth from '../../hooks/useAuth';
import useEventStore from '../../stores/events';
import useLicenseStore from '../../stores/license';
import { flexRowBaseStyle, flexRowCenteredStyle } from '../../styles/box';
import { hasAdminPermission } from '../../utils/auth';
import AccountMenu from '../AccountMenu';
import PromotionBanner from '../billing/PromotionBanner';
import ChangeLogButton from '../change-logs/ChangeLogButton';
import Header from './Header';

interface Props {
  children: React.ReactNode;
  user?: UserBase;
  license: SelfHostedLicenseResponse | CloudLicenseResponse | null;
}

const ConsoleBasicLayout = ({ children, user, license: licenseInfo }: Props) => {
  const { me, isLoading, error, mutate } = useAuth(user);
  const [license, updateLicense] = useLicenseStore((state) => [state.license, state.updateLicense], shallow);
  const router = useRouter();

  useEffect(() => {
    updateLicense(licenseInfo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licenseInfo]);

  useEffect(() => {
    useEventStore.subscribe(({ eventName, payload }) => {
      if (eventName === 'onLicenseUpdated') {
        if (payload) {
          updateLicense(payload as SelfHostedLicenseResponse | CloudLicenseResponse);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return null;
  }

  if (!me || error) {
    if (!me) {
      router.push(`/signin?redirect=${router.asPath}`);
      return null;
    }

    router.push(`/dashboard/${me.organizationAndUserAndOrganizationRoles?.[0].organizationId}`);
    return null;
  }

  return (
    <>
      <Box>
        <PromotionBanner />

        <Header
          links={license ? <LicenseTag licenseInfo={license} me={me} /> : null}
          right={
            <FlexRow>
              {process.env.NEXT_PUBLIC_ENV !== 'self-hosted' && (
                <Link href="/billing">
                  {hasAdminPermission(me) && (
                    <Button
                      type="text"
                      style={{ display: 'flex', alignItems: 'center' }}
                      icon={<ImPriceTag style={{ marginRight: '.4rem' }} />}
                    >
                      <Trans i18nKey="billing:plansAndBillingButtonTitle" />
                    </Button>
                  )}
                </Link>
              )}
              <Tooltip
                title="Community"
                arrow={false}
                overlayInnerStyle={{ fontSize: '.8rem' }}
                style={{ minHeight: '0' }}
              >
                <StyledLink
                  href={`https://join.slack.com/t/dogu-community/shared_invite/zt-1zespy16o-TgYIureSBI6ma6o_nG3gVw`}
                  target="_blank"
                >
                  <SlackOutlined />
                </StyledLink>
              </Tooltip>
              <ChangeLogButton me={me} mutateMe={mutate} />
              <AccountMenu />
            </FlexRow>
          }
        />
        <Content>{children}</Content>
      </Box>
    </>
  );
};

export default ConsoleBasicLayout;

const Box = styled.div`
  height: 100dvh;
  width: 100vw;
  display: flex;
  flex-direction: column;
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
  gap: .5rem;
`;

const StyledLink = styled(Link)`
  ${flexRowCenteredStyle}
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  color: #000;
  font-size: 1.2rem;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const Content = styled.main`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
`;
