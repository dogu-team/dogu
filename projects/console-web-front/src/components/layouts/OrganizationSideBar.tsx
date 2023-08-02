import React from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import { OrganizationBase } from '@dogu-private/console';
import useTranslation from 'next-translate/useTranslation';
import { BookOutlined, ClusterOutlined, ProjectOutlined, SettingOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, Menu, MenuProps, Skeleton } from 'antd';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { RiExternalLinkLine } from 'react-icons/ri';

import { swrAuthFetcher } from 'src/api';
import useAuthStore from 'src/stores/auth';
import { scrollbarStyle } from '../../styles/common';
import useCollapsibleSidebar from '../../stores/collapsible-sidebar';
import SideBarMenu from './SideBarMenu';
import SideBarTitle from './SideBarTitle';
import ProfileImage from '../ProfileImage';
import { flexRowCenteredStyle } from '../../styles/box';
import CollpaseSidebarMenu from './CollapseSidebarMenu';
import useRefresh from '../../hooks/useRefresh';

type MenuItem = Required<MenuProps>['items'];

const OrganizationSideBar = () => {
  const { me } = useAuthStore();
  const router = useRouter();
  const orgId = router.query.orgId;
  const { data, isLoading, mutate } = useSWR<OrganizationBase>(me && !!orgId && `/organizations/${orgId}`, swrAuthFetcher);
  const { t } = useTranslation();
  const collapsed = useCollapsibleSidebar((state) => state.collapsed);

  useRefresh(['onOrganizationUpdated'], mutate);

  if (isLoading) {
    return (
      <Box>
        <Skeleton active />
        <Skeleton active />
        <Skeleton active />
      </Box>
    );
  }

  const items: MenuItem = [
    {
      key: 'home',
      icon: collapsed ? (
        <OrganizationImageWrapper>
          <ProfileImage shape="square" size={28} name={data?.name} profileImageUrl={data?.profileImageUrl} />
        </OrganizationImageWrapper>
      ) : undefined,
      style: { cursor: 'default' },
      label: collapsed
        ? undefined
        : data && (
            <SideBarTitle
              href={`/dashboard/${orgId}`}
              subTitle={t('organization:sidebarSubTitle')}
              profileImageUrl={data.profileImageUrl}
              name={data.name}
              accessId={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'sb-title' : undefined}
            />
          ),
    },
    {
      type: 'divider',
    },
    {
      key: 'project',
      icon: collapsed ? (
        <StyledIconLink selected={router.asPath === `/dashboard/${orgId}/projects`} href={`/dashboard/${orgId}/projects`}>
          <ProjectOutlined />
        </StyledIconLink>
      ) : undefined,
      label: collapsed ? (
        t('organization:projectPageTitle')
      ) : (
        <SideBarMenu
          icon={<ProjectOutlined style={{ fontSize: '1.2rem' }} />}
          path={`/dashboard/${orgId}/projects`}
          text={t('organization:projectPageTitle')}
          accessId={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'side-bar-project' : undefined}
        />
      ),
      style: { borderRadius: '6px' },
    },
    {
      key: 'device-farm',
      icon: collapsed ? (
        <StyledIconLink selected={router.asPath.startsWith(`/dashboard/${orgId}/device-farm`)} href={`/dashboard/${orgId}/device-farm/hosts`}>
          <ClusterOutlined />
        </StyledIconLink>
      ) : undefined,
      label: collapsed ? (
        t('organization:deviceFarmPageTitle')
      ) : (
        <SideBarMenu
          icon={<ClusterOutlined style={{ fontSize: '1.2rem' }} />}
          path={`/dashboard/${orgId}/device-farm/hosts`}
          text={t('organization:deviceFarmPageTitle')}
          startWith={`/dashboard/${orgId}/device-farm`}
          accessId="side-bar-device-farm"
        />
      ),
      style: { borderRadius: '6px' },
    },
    { type: 'divider' },
    {
      key: 'member',
      icon: collapsed ? (
        <StyledIconLink selected={router.asPath.startsWith(`/dashboard/${orgId}/members`)} href={`/dashboard/${orgId}/members`}>
          <UserOutlined />
        </StyledIconLink>
      ) : undefined,
      label: collapsed ? (
        t('organization:memberPageTitle')
      ) : (
        <SideBarMenu
          icon={<UserOutlined style={{ fontSize: '1.2rem' }} />}
          path={`/dashboard/${orgId}/members`}
          text={t('organization:memberPageTitle')}
          startWith={`/dashboard/${orgId}/members`}
          accessId={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'side-bar-member' : undefined}
        />
      ),
      style: { borderRadius: '6px' },
    },
    {
      key: 'team',
      icon: collapsed ? (
        <StyledIconLink selected={router.asPath.startsWith(`/dashboard/${orgId}/teams`)} href={`/dashboard/${orgId}/teams`}>
          <TeamOutlined />
        </StyledIconLink>
      ) : undefined,
      label: collapsed ? (
        t('organization:teamPageTitle')
      ) : (
        <SideBarMenu
          icon={<TeamOutlined style={{ fontSize: '1.2rem' }} />}
          path={`/dashboard/${orgId}/teams`}
          text={t('organization:teamPageTitle')}
          startWith={`/dashboard/${orgId}/teams`}
          accessId={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'side-bar-team' : undefined}
        />
      ),
      style: { borderRadius: '6px' },
    },
    { type: 'divider' },
    {
      key: 'settings',
      icon: collapsed ? (
        <StyledIconLink selected={router.asPath === `/dashboard/${orgId}/settings`} href={`/dashboard/${orgId}/settings`}>
          <SettingOutlined />
        </StyledIconLink>
      ) : undefined,
      label: collapsed ? (
        t('organization:organizationSettingPageTitle')
      ) : (
        <SideBarMenu
          icon={<SettingOutlined style={{ fontSize: '1.2rem' }} />}
          path={`/dashboard/${orgId}/settings`}
          text={t('organization:organizationSettingPageTitle')}
          accessId={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'side-bar-setting' : undefined}
        />
      ),
      style: { borderRadius: '6px' },
    },
  ];

  const bottomItems: MenuProps['items'] = [
    {
      key: 'tutorial',
      icon: collapsed ? (
        <StyledIconLink selected={false} href="https://docs.dogutech.io/get-started/tutorials" target="_blank">
          <BookOutlined />
        </StyledIconLink>
      ) : undefined,
      label: collapsed ? (
        <div>
          {t('organization:tutorialPageTitle')}&nbsp;
          <RiExternalLinkLine />
        </div>
      ) : (
        <SideBarMenu
          icon={<BookOutlined style={{ fontSize: '1.2rem' }} />}
          path={'https://docs.dogutech.io/get-started/tutorials'}
          text={t('organization:tutorialPageTitle')}
          external
        />
      ),
    },
  ];

  return (
    <StyledSider collapsible collapsed={collapsed} trigger={null}>
      <StyledBox>
        <div style={{ position: 'relative', width: '100%', flex: 1, maxHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
          <SidebarInner>
            <Box>
              <Menu style={{ borderInline: 'none' }} items={items} mode="inline" />

              <div style={{ marginTop: '1rem' }}>
                <Menu style={{ borderInline: 'none' }} items={bottomItems} mode="inline" />
              </div>
            </Box>
          </SidebarInner>
        </div>

        <Wrapper>
          <CollpaseSidebarMenu />
        </Wrapper>
      </StyledBox>
    </StyledSider>
  );
};

export default OrganizationSideBar;

const StyledSider = styled(Layout.Sider)`
  position: relative;
  display: flex;
  width: ${(props) => (props.collapsed ? '' : '16rem !important')};
  min-width: ${(props) => (props.collapsed ? '' : '16rem !important')};
  max-width: ${(props) => (props.collapsed ? '' : '16rem !important')};
  transition: none;
  background-color: #ffffff !important;
  border-right: 1px solid ${(props) => props.theme.colors.gray2};
  flex: 1 !important;

  ${scrollbarStyle}

  & > div {
    display: flex;
    width: 100%;
    flex: 1;
  }

  .ant-menu-item-active {
    background-color: #fff !important;
  }
  .ant-menu-item-selected {
    color: #000 !important;
    background-color: #fff !important;
  }

  li {
    padding: 0 !important;
  }

  .ant-menu-inline-collapsed-tooltip {
    display: none;
  }

  @media only screen and (max-width: 1023px) {
    width: ${(props) => (props.collapsed ? '' : '14rem !important')};
    min-width: ${(props) => (props.collapsed ? '' : '14rem !important')};
    max-width: ${(props) => (props.collapsed ? '' : '14rem !important')};
  }

  @media only screen and (max-width: 767px) {
    display: none;
    opacity: 0;
  }
`;

const SidebarInner = styled.div`
  height: 100%;
`;

const Box = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  height: 100%;
  padding: 1rem;
  overflow-y: auto;
  overflow-x: hidden;
  overflow-y: overlay;
  justify-content: space-between;

  /* background-color: ${(props) => props.theme.colors.gray1}; */
  flex-shrink: 0;

  @media only screen and (max-width: 767px) {
    /* background-color: #fff; */
  }
`;

const OrganizationImageWrapper = styled.div`
  ${flexRowCenteredStyle}
  width: 100%;
  height: 100%;
`;

const StyledIconLink = styled(Link)<{ selected: boolean }>`
  ${flexRowCenteredStyle}
  width: 100%;
  height: 100%;
  background-color: ${(props) => (props.selected ? `${props.theme.colorPrimary}66` : '#fff')};

  &:hover {
    background-color: ${(props) => props.theme.colorPrimary}22;
  }
`;

const Wrapper = styled.div`
  position: absolute;
  right: -0.5rem;
  top: 0;
  bottom: 0;
  z-index: 99;
`;

const StyledBox = styled.div`
  position: sticky;
  top: 0;
  width: 100%;
  height: 100%;
  max-height: 100vh;
  display: flex;
  padding-bottom: 3rem;
`;
