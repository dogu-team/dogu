import React from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import { ProjectBase } from '@dogu-private/console';
import useTranslation from 'next-translate/useTranslation';
import { AppstoreOutlined, ArrowLeftOutlined, MobileOutlined, SettingOutlined, TeamOutlined } from '@ant-design/icons';
import { PiMonitorPlayBold } from 'react-icons/pi';
import { BiVideoRecording } from 'react-icons/bi';
import { Layout, Menu, MenuProps, Skeleton } from 'antd';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { RiRemoteControlLine } from 'react-icons/ri';
import { GoWorkflow } from 'react-icons/go';
import { OrganizationId } from '@dogu-private/types';

import { swrAuthFetcher } from 'src/api';
import useAuthStore from 'src/stores/auth';
import { scrollbarStyle } from '../../styles/common';
import useCollapsibleSidebar from '../../stores/collapsible-sidebar';
import SideBarMenu from './SideBarMenu';
import SideBarTitle from './SideBarTitle';
import ProfileImage from '../ProfileImage';
import { flexRowCenteredStyle } from '../../styles/box';
import CollpaseSidebarMenu from './CollapseSidebarMenu';
import ProjectSwitch from '../projects/ProjectSwitch';
import useRefresh from '../../hooks/useRefresh';

type MenuItem = Required<MenuProps>['items'];

const ProjectSideBar = () => {
  const { me } = useAuthStore();
  const router = useRouter();
  const orgId = router.query.orgId;
  const projectId = router.query.pid;
  const { data, isLoading, mutate } = useSWR<ProjectBase>(me && !!orgId && !!projectId && `/organizations/${orgId}/projects/${projectId}`, swrAuthFetcher);
  const { t } = useTranslation();
  const collapsed = useCollapsibleSidebar((state) => state.collapsed);

  useRefresh(['onProjectUpdated'], () => mutate());

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
        <ProjectSwitch
          organizationId={orgId as OrganizationId}
          onChange={(project) => router.push(`/dashboard/${orgId}/projects/${project.projectId}/remotes`)}
          selectedProject={data}
          hideIcon
        >
          <OrganizationImageWrapper>
            <ProfileImage shape="square" size={28} name={data?.name} profileImageUrl={null} />
          </OrganizationImageWrapper>
        </ProjectSwitch>
      ) : undefined,
      style: { cursor: 'default' },
      label: collapsed
        ? undefined
        : data && (
            <ProjectSwitch
              organizationId={orgId as OrganizationId}
              onChange={(project) => router.push(`/dashboard/${orgId}/projects/${project.projectId}/remotes`)}
              selectedProject={data}
            >
              <SideBarTitle href={`/dashboard/${orgId}`} subTitle={t('organization:sidebarSubTitle')} profileImageUrl={null} name={data.name} accessId="sb-title" />
            </ProjectSwitch>
          ),
    },
    {
      type: 'group',
      label: collapsed ? null : 'Automation',
      children: [
        {
          key: 'remote',
          label: collapsed ? (
            t('project:tabMenuRemoteTitle')
          ) : (
            <SideBarMenu
              path={`/dashboard/${orgId}/projects/${projectId}/remotes`}
              text={t('project:tabMenuRemoteTitle')}
              accessId="project-side-bar-remote"
              icon={<RiRemoteControlLine style={{ fontSize: '1.2rem' }} />}
              startWith={`/dashboard/${orgId}/projects/${projectId}/remotes`}
            />
          ),
          icon: collapsed ? (
            <StyledIconLink selected={router.asPath.startsWith(`/dashboard/${orgId}/projects/${projectId}/remotes`)} href={`/dashboard/${orgId}/projects/${projectId}/remotes`}>
              <RiRemoteControlLine />
            </StyledIconLink>
          ) : undefined,
        },
        {
          key: 'routine',
          label: collapsed ? (
            t('project:tabMenuRoutineTitle')
          ) : (
            <SideBarMenu
              path={`/dashboard/${orgId}/projects/${projectId}/routines`}
              text={t('project:tabMenuRoutineTitle')}
              accessId="project-side-bar-routine"
              icon={<GoWorkflow style={{ fontSize: '1.2rem' }} />}
              startWith={`/dashboard/${orgId}/projects/${projectId}/routines`}
            />
          ),
          icon: collapsed ? (
            <StyledIconLink selected={router.asPath.startsWith(`/dashboard/${orgId}/projects/${projectId}/routines`)} href={`/dashboard/${orgId}/projects/${projectId}/routines`}>
              <GoWorkflow />
            </StyledIconLink>
          ) : undefined,
        },
        {
          key: 'record',
          label: collapsed ? (
            'Record testing'
          ) : (
            <SideBarMenu
              path={`/dashboard/${orgId}/projects/${projectId}/records/cases`}
              text={'Record testing'}
              accessId="project-side-bar-routine"
              icon={<BiVideoRecording style={{ fontSize: '1.2rem' }} />}
              startWith={`/dashboard/${orgId}/projects/${projectId}/records`}
            />
          ),
          icon: collapsed ? (
            <StyledIconLink
              selected={router.asPath.startsWith(`/dashboard/${orgId}/projects/${projectId}/records`)}
              href={`/dashboard/${orgId}/projects/${projectId}/records/cases`}
            >
              <BiVideoRecording />
            </StyledIconLink>
          ) : undefined,
        },
      ],
    },
    {
      type: 'group',
      label: collapsed ? null : 'Studio',
      children: [
        {
          key: 'studio',
          label: collapsed ? (
            t('project:tabMenuStudioTitle')
          ) : (
            <SideBarMenu
              path={`/dashboard/${orgId}/projects/${projectId}/studio`}
              text={t('project:tabMenuStudioTitle')}
              accessId="project-side-bar-studio"
              icon={<PiMonitorPlayBold style={{ fontSize: '1.2rem' }} />}
              external
            />
          ),
          icon: collapsed ? (
            <StyledIconLink
              selected={router.asPath.startsWith(`/dashboard/${orgId}/projects/${projectId}/studio`)}
              href={`/dashboard/${orgId}/projects/${projectId}/studio`}
              target="_blank"
            >
              <PiMonitorPlayBold />
            </StyledIconLink>
          ) : undefined,
        },
        {
          key: 'devices',
          label: collapsed ? (
            t('project:tabMenuDeviceTitle')
          ) : (
            <SideBarMenu
              path={`/dashboard/${orgId}/projects/${projectId}/devices`}
              text={t('project:tabMenuDeviceTitle')}
              accessId="project-side-bar-devices"
              icon={<MobileOutlined style={{ fontSize: '1.2rem' }} />}
            />
          ),
          icon: collapsed ? (
            <StyledIconLink selected={router.asPath === `/dashboard/${orgId}/projects/${projectId}/devices`} href={`/dashboard/${orgId}/projects/${projectId}/devices`}>
              <MobileOutlined />
            </StyledIconLink>
          ) : undefined,
        },
      ],
    },
    {
      type: 'group',
      label: collapsed ? null : 'General',
      children: [
        {
          key: 'app',
          label: collapsed ? (
            t('project:tabMenuAppTitle')
          ) : (
            <SideBarMenu
              path={`/dashboard/${orgId}/projects/${projectId}/apps`}
              text={t('project:tabMenuAppTitle')}
              accessId="project-side-bar-apps"
              icon={<AppstoreOutlined style={{ fontSize: '1.2rem' }} />}
            />
          ),
          icon: collapsed ? (
            <StyledIconLink selected={router.asPath === `/dashboard/${orgId}/projects/${projectId}/apps`} href={`/dashboard/${orgId}/projects/${projectId}/apps`}>
              <AppstoreOutlined />
            </StyledIconLink>
          ) : undefined,
        },
        {
          key: 'members',
          label: collapsed ? (
            t('project:tabMenuMemberTitle')
          ) : (
            <SideBarMenu
              path={`/dashboard/${orgId}/projects/${projectId}/members`}
              text={t('project:tabMenuMemberTitle')}
              accessId="project-side-bar-members"
              icon={<TeamOutlined style={{ fontSize: '1.2rem' }} />}
            />
          ),
          icon: collapsed ? (
            <StyledIconLink selected={router.asPath === `/dashboard/${orgId}/projects/${projectId}/members`} href={`/dashboard/${orgId}/projects/${projectId}/members`}>
              <TeamOutlined />
            </StyledIconLink>
          ) : undefined,
        },
        {
          key: 'setting',
          label: collapsed ? (
            t('project:tabMenuSettingTitle')
          ) : (
            <SideBarMenu
              path={`/dashboard/${orgId}/projects/${projectId}/settings`}
              text={t('project:tabMenuSettingTitle')}
              accessId="project-side-bar-settings"
              icon={<SettingOutlined style={{ fontSize: '1.2rem' }} />}
            />
          ),
          icon: collapsed ? (
            <StyledIconLink selected={router.asPath === `/dashboard/${orgId}/projects/${projectId}/settings`} href={`/dashboard/${orgId}/projects/${projectId}/settings`}>
              <SettingOutlined />
            </StyledIconLink>
          ) : undefined,
        },
      ],
    },
  ];

  const bottomItems: MenuProps['items'] = [
    {
      key: 'back',
      icon: collapsed ? (
        <StyledIconLink selected={false} href={`/dashboard/${orgId}/projects`}>
          <ArrowLeftOutlined />
        </StyledIconLink>
      ) : undefined,
      label: collapsed ? (
        <div>
          <ArrowLeftOutlined />
          {t('project:tabMenuBackOrganizationTitle')}
        </div>
      ) : (
        <SideBarMenu
          icon={<ArrowLeftOutlined style={{ fontSize: '1.2rem' }} />}
          path={`/dashboard/${orgId}/projects`}
          text={t('project:tabMenuBackOrganizationTitle')}
          accessId="project-side-bar-back"
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

export default ProjectSideBar;

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
