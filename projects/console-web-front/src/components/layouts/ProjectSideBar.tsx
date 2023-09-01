import React from 'react';
import styled from 'styled-components';
import { PROJECT_TYPE } from '@dogu-private/types';
import useTranslation from 'next-translate/useTranslation';
import { AppstoreOutlined, ArrowLeftOutlined, MobileOutlined, SettingOutlined, TeamOutlined } from '@ant-design/icons';
import { PiMonitorPlayBold } from 'react-icons/pi';
import { Layout, Menu, MenuProps } from 'antd';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { RiRemoteControlLine } from 'react-icons/ri';
import { GoWorkflow } from 'react-icons/go';
import { OrganizationId } from '@dogu-private/types';

import { scrollbarStyle } from '../../styles/common';
import useCollapsibleSidebar from '../../stores/collapsible-sidebar';
import SideBarMenu from './SideBarMenu';
import SideBarTitle from './SideBarTitle';
import ProfileImage from '../ProfileImage';
import { flexRowCenteredStyle } from '../../styles/box';
import CollpaseSidebarMenu from './CollapseSidebarMenu';
import ProjectSwitch from '../projects/ProjectSwitch';
import useRefresh from '../../hooks/useRefresh';
import useProjectContext from '../../hooks/useProjectContext';

type MenuItem = Required<MenuProps>['items'];

const ProjectSideBar = () => {
  const router = useRouter();
  const { project, mutate } = useProjectContext();
  const { t } = useTranslation();
  const collapsed = useCollapsibleSidebar((state) => state.collapsed);

  useRefresh(['onProjectUpdated'], () => mutate?.());

  const generalChildrens: MenuItem = [
    {
      key: 'app',
      label: collapsed ? (
        t('project:tabMenuAppTitle')
      ) : (
        <SideBarMenu
          path={`/dashboard/${project?.organizationId}/projects/${project?.projectId}/apps`}
          text={t('project:tabMenuAppTitle')}
          accessId="project-side-bar-apps"
          icon={<AppstoreOutlined style={{ fontSize: '1.2rem' }} />}
        />
      ),
      icon: collapsed ? (
        <StyledIconLink
          selected={router.asPath === `/dashboard/${project?.organizationId}/projects/${project?.projectId}/apps`}
          href={`/dashboard/${project?.organizationId}/projects/${project?.projectId}/apps`}
        >
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
          path={`/dashboard/${project?.organizationId}/projects/${project?.projectId}/members`}
          text={t('project:tabMenuMemberTitle')}
          accessId="project-side-bar-members"
          icon={<TeamOutlined style={{ fontSize: '1.2rem' }} />}
        />
      ),
      icon: collapsed ? (
        <StyledIconLink
          selected={router.asPath === `/dashboard/${project?.organizationId}/projects/${project?.projectId}/members`}
          href={`/dashboard/${project?.organizationId}/projects/${project?.projectId}/members`}
        >
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
          path={`/dashboard/${project?.organizationId}/projects/${project?.projectId}/settings`}
          text={t('project:tabMenuSettingTitle')}
          accessId="project-side-bar-settings"
          icon={<SettingOutlined style={{ fontSize: '1.2rem' }} />}
        />
      ),
      icon: collapsed ? (
        <StyledIconLink
          selected={router.asPath === `/dashboard/${project?.organizationId}/projects/${project?.projectId}/settings`}
          href={`/dashboard/${project?.organizationId}/projects/${project?.projectId}/settings`}
        >
          <SettingOutlined />
        </StyledIconLink>
      ) : undefined,
    },
  ];

  const items: MenuItem = [
    {
      key: 'home',
      icon: collapsed ? (
        <ProjectSwitch
          organizationId={project?.organizationId as OrganizationId}
          onChange={(project) => router.push(`/dashboard/${project?.organizationId}/projects/${project.projectId}/remotes`)}
          selectedProject={project ?? undefined}
          hideIcon
        >
          <OrganizationImageWrapper>
            <ProfileImage shape="square" size={28} name={project?.name} profileImageUrl={null} />
          </OrganizationImageWrapper>
        </ProjectSwitch>
      ) : undefined,
      style: { cursor: 'default' },
      label: collapsed
        ? undefined
        : project && (
            <ProjectSwitch
              organizationId={project?.organizationId as OrganizationId}
              onChange={(project) => router.push(`/dashboard/${project?.organizationId}/projects/${project.projectId}/remotes`)}
              selectedProject={project}
            >
              <SideBarTitle profileImageUrl={null} name={project.name} accessId="sb-title" />
            </ProjectSwitch>
          ),
    },
    {
      type: 'group',
      label: collapsed ? null : 'Test Automation',
      children: [
        {
          key: 'remote',
          label: collapsed ? (
            t('project:tabMenuRemoteTitle')
          ) : (
            <SideBarMenu
              path={`/dashboard/${project?.organizationId}/projects/${project?.projectId}/remotes`}
              text={t('project:tabMenuRemoteTitle')}
              accessId="project-side-bar-remote"
              icon={<RiRemoteControlLine style={{ fontSize: '1.2rem' }} />}
              startWith={`/dashboard/${project?.organizationId}/projects/${project?.projectId}/remotes`}
            />
          ),
          icon: collapsed ? (
            <StyledIconLink
              selected={router.asPath.startsWith(`/dashboard/${project?.organizationId}/projects/${project?.projectId}/remotes`)}
              href={`/dashboard/${project?.organizationId}/projects/${project?.projectId}/remotes`}
            >
              <RiRemoteControlLine />
            </StyledIconLink>
          ) : undefined,
        },
      ],
    },
    {
      type: 'group',
      label: collapsed ? null : 'Test CI',
      children: [
        {
          key: 'routine',
          label: collapsed ? (
            t('project:tabMenuRoutineTitle')
          ) : (
            <SideBarMenu
              path={`/dashboard/${project?.organizationId}/projects/${project?.projectId}/routines`}
              text={t('project:tabMenuRoutineTitle')}
              accessId="project-side-bar-routine"
              icon={<GoWorkflow style={{ fontSize: '1.2rem' }} />}
              startWith={`/dashboard/${project?.organizationId}/projects/${project?.projectId}/routines`}
            />
          ),
          icon: collapsed ? (
            <StyledIconLink
              selected={router.asPath.startsWith(`/dashboard/${project?.organizationId}/projects/${project?.projectId}/routines`)}
              href={`/dashboard/${project?.organizationId}/projects/${project?.projectId}/routines`}
            >
              <GoWorkflow />
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
              path={`/dashboard/${project?.organizationId}/projects/${project?.projectId}/studio`}
              text={t('project:tabMenuStudioTitle')}
              accessId="project-side-bar-studio"
              icon={<PiMonitorPlayBold style={{ fontSize: '1.2rem' }} />}
              external
            />
          ),
          icon: collapsed ? (
            <StyledIconLink
              selected={router.asPath.startsWith(`/dashboard/${project?.organizationId}/projects/${project?.projectId}/studio`)}
              href={`/dashboard/${project?.organizationId}/projects/${project?.projectId}/studio`}
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
              path={`/dashboard/${project?.organizationId}/projects/${project?.projectId}/devices`}
              text={t('project:tabMenuDeviceTitle')}
              accessId="project-side-bar-devices"
              icon={<MobileOutlined style={{ fontSize: '1.2rem' }} />}
            />
          ),
          icon: collapsed ? (
            <StyledIconLink
              selected={router.asPath === `/dashboard/${project?.organizationId}/projects/${project?.projectId}/devices`}
              href={`/dashboard/${project?.organizationId}/projects/${project?.projectId}/devices`}
            >
              <MobileOutlined />
            </StyledIconLink>
          ) : undefined,
        },
      ],
    },
    {
      type: 'group',
      label: collapsed ? null : 'General',
      children: project?.type === PROJECT_TYPE.WEB ? generalChildrens.filter((child) => child?.key !== 'app') : generalChildrens,
    },
  ];

  const bottomItems: MenuProps['items'] = [
    {
      key: 'back',
      icon: collapsed ? (
        <StyledIconLink selected={false} href={`/dashboard/${project?.organizationId}/projects`}>
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
          path={`/dashboard/${project?.organizationId}/projects`}
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
