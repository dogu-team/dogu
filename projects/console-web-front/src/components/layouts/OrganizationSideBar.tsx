import React from 'react';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';
import {
  AppstoreOutlined,
  BookOutlined,
  ClusterOutlined,
  MobileOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Layout, Menu, MenuProps } from 'antd';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { RiExternalLinkLine } from 'react-icons/ri';
import { HiOutlineDevicePhoneMobile } from 'react-icons/hi2';
import { IoAppsSharp } from 'react-icons/io5';
import { GoBrowser } from 'react-icons/go';
import Image from 'next/image';

import { scrollbarStyle } from '../../styles/common';
import useCollapsibleSidebar from '../../stores/collapsible-sidebar';
import SideBarMenu from './SideBarMenu';
import SideBarTitle from './SideBarTitle';
import ProfileImage from '../ProfileImage';
import { flexRowCenteredStyle } from '../../styles/box';
import CollpaseSidebarMenu from './CollapseSidebarMenu';
import useRefresh from '../../hooks/useRefresh';
import useOrganizationContext from '../../hooks/context/useOrganizationContext';
import resources from '../../resources';
// import { IS_CLOUD } from '../../../pages/_app';

type MenuItem = Required<MenuProps>['items'];

const OrganizationSideBar = () => {
  const router = useRouter();
  const { organization, mutate } = useOrganizationContext();
  const { t } = useTranslation();
  const collapsed = useCollapsibleSidebar((state) => state.collapsed);

  useRefresh(['onOrganizationUpdated'], () => mutate?.());

  const items: MenuItem = [
    {
      key: 'home',
      icon: collapsed ? (
        <OrganizationImageWrapper>
          <ProfileImage
            shape="square"
            size={28}
            name={organization?.name}
            profileImageUrl={organization?.profileImageUrl}
          />
        </OrganizationImageWrapper>
      ) : undefined,
      style: { cursor: 'default' },
      label: collapsed
        ? undefined
        : organization && (
            <SideBarTitle profileImageUrl={organization.profileImageUrl} name={organization.name} accessId="sb-title" />
          ),
    },
    process.env.NEXT_PUBLIC_ENV !== 'self-hosted'
      ? {
          type: 'group',
          label: collapsed ? null : 'Maunal Testing',
          children: [
            {
              key: 'live-testing',
              icon: collapsed ? (
                <StyledIconLink
                  selected={router.asPath === `/dashboard/${organization?.organizationId}/live-testing`}
                  href={`/dashboard/${organization?.organizationId}/live-testing`}
                >
                  <HiOutlineDevicePhoneMobile />
                </StyledIconLink>
              ) : undefined,
              label: collapsed ? (
                t('organization:liveTestingPageTitle')
              ) : (
                <SideBarMenu
                  icon={<HiOutlineDevicePhoneMobile style={{ fontSize: '1.2rem' }} />}
                  path={`/dashboard/${organization?.organizationId}/live-testing`}
                  text={t('organization:liveTestingPageTitle')}
                  accessId={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'side-bar-live-testing' : undefined}
                />
              ),
              style: { borderRadius: '6px' },
            },
          ],
        }
      : null,
    // process.env.NEXT_PUBLIC_ENV !== 'self-hosted'
    //   ? {
    //       type: 'group',
    //       label: collapsed ? null : 'Web',
    //       children: [
    //         {
    //           key: 'web-responsive',
    //           icon: collapsed ? (
    //             <StyledIconLink
    //               selected={router.asPath === `/dashboard/${organization?.organizationId}/web-responsive`}
    //               href={`/dashboard/${organization?.organizationId}/web-responsive`}
    //             >
    //               <MdOutlineWeb />
    //             </StyledIconLink>
    //           ) : undefined,
    //           label: collapsed ? (
    //             t('organization:responsiveWebPageTitle')
    //           ) : (
    //             <SideBarMenu
    //               icon={<MdOutlineWeb style={{ fontSize: '1.2rem' }} />}
    //               path={`/dashboard/${organization?.organizationId}/web-responsive`}
    //               text={t('organization:responsiveWebPageTitle')}
    //               accessId={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'side-bar-web-responsive' : undefined}
    //             />
    //           ),
    //           style: { borderRadius: '6px' },
    //         },
    //       ],
    //     }
    //   : null,
    {
      type: 'group',
      label: collapsed ? null : 'Test Automation',
      children: [
        {
          key: 'web-automation',
          icon: collapsed ? (
            <StyledIconLink
              selected={router.asPath.startsWith(`/dashboard/${organization?.organizationId}/automation/web`)}
              href={`/dashboard/${organization?.organizationId}/automation/web`}
            >
              <GoBrowser />
            </StyledIconLink>
          ) : undefined,
          label: collapsed ? (
            t('organization:sidebarWebAutomation')
          ) : (
            <SideBarMenu
              icon={<GoBrowser style={{ fontSize: '1.2rem' }} />}
              path={`/dashboard/${organization?.organizationId}/automation/web`}
              text={t('organization:sidebarWebAutomation')}
              accessId={'side-bar-web-automation'}
              startWith={`/dashboard/${organization?.organizationId}/automation/web`}
            />
          ),
          style: { borderRadius: '6px' },
        },
        {
          key: 'app-automation',
          icon: collapsed ? (
            <StyledIconLink
              selected={router.asPath.startsWith(`/dashboard/${organization?.organizationId}/automation/mobile-apps`)}
              href={`/dashboard/${organization?.organizationId}/automation/mobile-apps`}
            >
              <MobileOutlined />
            </StyledIconLink>
          ) : undefined,
          label: collapsed ? (
            t('organization:sidebarMobileAppAutomation')
          ) : (
            <SideBarMenu
              icon={<MobileOutlined style={{ fontSize: '1.2rem' }} />}
              path={`/dashboard/${organization?.organizationId}/automation/mobile-apps`}
              text={t('organization:sidebarMobileAppAutomation')}
              accessId={'side-bar-app-automation'}
              startWith={`/dashboard/${organization?.organizationId}/automation/mobile-apps`}
            />
          ),
          style: { borderRadius: '6px' },
        },
        {
          key: 'game-automation',
          icon: collapsed ? (
            <StyledIconLink
              selected={router.asPath.startsWith(`/dashboard/${organization?.organizationId}/automation/mobile-game`)}
              href={`/dashboard/${organization?.organizationId}/automation/mobile-game`}
            >
              <Image
                src={resources.icons.mobileGame}
                width={24}
                height={24}
                alt="mobile-game"
                style={{ width: '1rem', height: '1rem' }}
              />
            </StyledIconLink>
          ) : undefined,
          label: collapsed ? (
            t('organization:sidebarMobileGameAutomation')
          ) : (
            <SideBarMenu
              icon={
                <Image
                  src={resources.icons.mobileGame}
                  width={24}
                  height={24}
                  alt="mobile-game"
                  style={{ width: '1.2rem', height: '1.2rem' }}
                />
              }
              path={`/dashboard/${organization?.organizationId}/automation/mobile-game`}
              text={t('organization:sidebarMobileGameAutomation')}
              accessId={'side-bar-game-automation'}
              startWith={`/dashboard/${organization?.organizationId}/automation/mobile-game`}
            />
          ),
          style: { borderRadius: '6px' },
        },
      ],
    },
    {
      type: 'group',
      label: collapsed ? null : 'Self Device',
      children: [
        {
          key: 'device-farm',
          icon: collapsed ? (
            <StyledIconLink
              selected={router.asPath.startsWith(`/dashboard/${organization?.organizationId}/device-farm`)}
              href={`/dashboard/${organization?.organizationId}/device-farm/devices`}
            >
              <ClusterOutlined />
            </StyledIconLink>
          ) : undefined,
          label: collapsed ? (
            t('organization:deviceFarmPageTitle')
          ) : (
            <SideBarMenu
              icon={<ClusterOutlined style={{ fontSize: '1.2rem' }} />}
              path={`/dashboard/${organization?.organizationId}/device-farm/devices`}
              text={t('organization:deviceFarmPageTitle')}
              startWith={`/dashboard/${organization?.organizationId}/device-farm`}
              accessId="side-bar-device-farm"
            />
          ),
          style: { borderRadius: '6px' },
        },
      ],
    },
    {
      type: 'group',
      label: collapsed ? null : 'Storage',
      children: [
        {
          key: 'application',
          icon: collapsed ? (
            <StyledIconLink
              selected={router.asPath === `/dashboard/${organization?.organizationId}/apps`}
              href={`/dashboard/${organization?.organizationId}/apps`}
            >
              <AppstoreOutlined />
            </StyledIconLink>
          ) : undefined,
          label: collapsed ? (
            t('organization:appsPageTitle')
          ) : (
            <SideBarMenu
              icon={<AppstoreOutlined style={{ fontSize: '1.2rem' }} />}
              path={`/dashboard/${organization?.organizationId}/apps`}
              text={t('organization:appsPageTitle')}
              accessId={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'side-bar-apps' : undefined}
            />
          ),
          style: { borderRadius: '6px' },
        },
      ],
    },
    {
      type: 'group',
      label: collapsed ? null : 'General',
      children: [
        {
          key: 'member',
          icon: collapsed ? (
            <StyledIconLink
              selected={router.asPath.startsWith(`/dashboard/${organization?.organizationId}/members`)}
              href={`/dashboard/${organization?.organizationId}/members`}
            >
              <UserOutlined />
            </StyledIconLink>
          ) : undefined,
          label: collapsed ? (
            t('organization:memberPageTitle')
          ) : (
            <SideBarMenu
              icon={<UserOutlined style={{ fontSize: '1.2rem' }} />}
              path={`/dashboard/${organization?.organizationId}/members`}
              text={t('organization:memberPageTitle')}
              startWith={`/dashboard/${organization?.organizationId}/members`}
              accessId={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'side-bar-member' : undefined}
            />
          ),
          style: { borderRadius: '6px' },
        },
        {
          key: 'team',
          icon: collapsed ? (
            <StyledIconLink
              selected={router.asPath.startsWith(`/dashboard/${organization?.organizationId}/teams`)}
              href={`/dashboard/${organization?.organizationId}/teams`}
            >
              <TeamOutlined />
            </StyledIconLink>
          ) : undefined,
          label: collapsed ? (
            t('organization:teamPageTitle')
          ) : (
            <SideBarMenu
              icon={<TeamOutlined style={{ fontSize: '1.2rem' }} />}
              path={`/dashboard/${organization?.organizationId}/teams`}
              text={t('organization:teamPageTitle')}
              startWith={`/dashboard/${organization?.organizationId}/teams`}
              accessId={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'side-bar-team' : undefined}
            />
          ),
          style: { borderRadius: '6px' },
        },
        {
          key: 'settings',
          icon: collapsed ? (
            <StyledIconLink
              selected={router.asPath === `/dashboard/${organization?.organizationId}/settings`}
              href={`/dashboard/${organization?.organizationId}/settings`}
            >
              <SettingOutlined />
            </StyledIconLink>
          ) : undefined,
          label: collapsed ? (
            t('organization:organizationSettingPageTitle')
          ) : (
            <SideBarMenu
              icon={<SettingOutlined style={{ fontSize: '1.2rem' }} />}
              path={`/dashboard/${organization?.organizationId}/settings`}
              text={t('organization:organizationSettingPageTitle')}
              accessId={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'side-bar-setting' : undefined}
            />
          ),
          style: { borderRadius: '6px' },
        },
      ],
    },
  ];

  const bottomItems: MenuProps['items'] = [
    {
      key: 'tutorial',
      icon: collapsed ? (
        <StyledIconLink selected={false} href="https://docs.dogutech.io" target="_blank">
          <BookOutlined />
        </StyledIconLink>
      ) : undefined,
      label: collapsed ? (
        <div>
          {t('organization:docs')}&nbsp;
          <RiExternalLinkLine />
        </div>
      ) : (
        <SideBarMenu
          icon={<BookOutlined style={{ fontSize: '1.2rem' }} />}
          path={'https://docs.dogutech.io'}
          text={t('organization:docs')}
          external
        />
      ),
    },
  ];

  return (
    <StyledSider collapsible collapsed={collapsed} trigger={null}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          flex: 1,
          maxHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'none',
        }}
      >
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
    </StyledSider>
  );
};

export default OrganizationSideBar;

const StyledSider = styled(Layout.Sider)`
  position: relative;
  display: flex;
  width: ${(props) => (props.collapsed ? '' : '15rem !important')};
  min-width: ${(props) => (props.collapsed ? '' : '15rem !important')};
  max-width: ${(props) => (props.collapsed ? '' : '15rem !important')};
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
