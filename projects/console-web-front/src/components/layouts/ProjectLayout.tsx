import { Button, Layout } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import styled, { keyframes } from 'styled-components';
import useSWR from 'swr';
import Link from 'next/link';
import { OrganizationBase, ProjectBase } from '@dogu-private/console';
import { AppstoreOutlined, ArrowRightOutlined, GatewayOutlined, ProjectOutlined, QuestionCircleOutlined, SettingOutlined, TabletOutlined, TeamOutlined } from '@ant-design/icons';

import useAuth from 'src/hooks/useAuth';
import { swrAuthFetcher } from 'src/api';
import H4 from '../common/headings/H4';
import MenuLinkTabs, { MenuLinkTabProps } from '../MenuLinkTabs';
import ConsoleBasicLayout from './ConsoleBasicLayout';
import { scrollbarStyle } from '../../styles/common';
import GitIntegrationTag from '../projects/GitIntegrationTag';
import { flexRowSpaceBetweenStyle } from '../../styles/box';

interface Props {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  isGitIntegrated: boolean;
}

const ProjectLayout = ({ children, sidebar, isGitIntegrated }: Props) => {
  const { me, error, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const organizationId = router.query.orgId;
  const projectId = router.query.pid;
  const { data: organization, error: organizationError } = useSWR<OrganizationBase>(organizationId && `/organizations/${organizationId}`, swrAuthFetcher);
  const { data: project, error: projectError } = useSWR<ProjectBase>(organizationId && projectId && `/organizations/${organizationId}/projects/${projectId}`, swrAuthFetcher);

  if (organizationError || projectError) {
    return null;
  }

  const tabs: MenuLinkTabProps['tabs'] = [
    // { href: `/dashboard/${organizationId}/projects/${projectId}`, icon: <HomeOutlined />, title: t('project:tabMenuHomeTitle'), 'access-id': 'project-home-tab' },
    {
      href: `/dashboard/${organizationId}/projects/${projectId}/routines`,
      icon: <GatewayOutlined />,
      title: t('project:tabMenuRoutineTitle'),
      startsWith: true,
      'access-id': 'project-routine-tab',
    },
    {
      href: `/dashboard/${organizationId}/projects/${projectId}/apps`,
      icon: <AppstoreOutlined />,
      title: t('project:tabMenuAppTitle'),
      'access-id': 'project-app-tab',
    },
    { href: `/dashboard/${organizationId}/projects/${projectId}/devices`, icon: <TabletOutlined />, title: t('project:tabMenuDeviceTitle'), 'access-id': 'project-device-tab' },
    { href: `/dashboard/${organizationId}/projects/${projectId}/members`, icon: <TeamOutlined />, title: t('project:tabMenuMemberTitle'), 'access-id': 'project-member-tab' },
    { href: `/dashboard/${organizationId}/projects/${projectId}/settings`, icon: <SettingOutlined />, title: t('project:tabMenuSettingTitle'), 'access-id': 'project-setting-tab' },
  ];

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
    <ConsoleBasicLayout>
      <MainLayout offset={56}>
        <Content>
          <HeaderBox>
            <FlexSpaceBetween>
              <TitleBox>
                <ProjectOutlined style={{ fontSize: '1.2rem', marginRight: '0.25rem' }} />
                <Link href={`/dashboard/${organization?.organizationId}/projects`} access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'project-layout-org-name' : undefined}>
                  <StyledTitle>{organization?.name}</StyledTitle>
                </Link>
                &nbsp;/&nbsp;
                <Link
                  href={`/dashboard/${organizationId}/projects/${projectId}`}
                  access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'project-layout-project-name' : undefined}
                >
                  <StyledTitle>{project?.name}</StyledTitle>
                </Link>
                <div style={{ marginLeft: '.5rem' }}>
                  <GitIntegrationTag isGitIntegrated={isGitIntegrated} />
                </div>
              </TitleBox>
              <div>
                <Link href={`/dashboard/${organizationId}/projects/${projectId}/get-started`}>
                  <StyledButton type="link">
                    Tutorial
                    <ArrowRightOutlined />
                  </StyledButton>
                </Link>
              </div>
            </FlexSpaceBetween>
            <Description>{project?.description}</Description>
          </HeaderBox>

          <NavigationBar>
            <MenuLinkTabs tabs={tabs} />
          </NavigationBar>

          <PageContainer>
            {!!sidebar && <SideBar offset={56}>{sidebar}</SideBar>}
            <Page>
              <PageInner hasSidebar={!!sidebar}>{children}</PageInner>
            </Page>
          </PageContainer>
        </Content>
      </MainLayout>
    </ConsoleBasicLayout>
  );
};

export default ProjectLayout;

const MainLayout = styled(Layout)<{ offset: number }>`
  flex: 1;
  background-color: #fff;

  ${scrollbarStyle}
`;

const Content = styled(MainLayout.Content)`
  display: flex;
  width: 100%;
  margin: 0 auto;
  flex-direction: column;
`;

const HeaderBox = styled.div`
  display: flex;
  padding: 0 32px;
  height: 5rem;
  flex-direction: column;
  justify-content: flex-end;
`;

const TitleBox = styled.div`
  display: flex;
  margin-bottom: 0.25rem;
  align-items: center;
  font-size: 1.45rem;
`;

const StyledTitle = styled(H4)`
  max-width: 500px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Description = styled.p`
  max-width: 500px;
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.gray5};
  overflow-wrap: break-word;
`;

const PageContainer = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  flex: 1;
`;

const Page = styled.div`
  display: flex;
  width: 100%;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  /* overflow-x: hidden; */
`;

const PageInner = styled.div<{ hasSidebar: boolean }>`
  height: 100%;
  min-height: ${(props) => (props.hasSidebar ? 'none' : '100%')};
  padding: 1.5rem 2rem 3rem ${(props) => (props.hasSidebar ? '1rem' : '2rem')};
  /* min-height: calc(100dvh - 64px); */

  @media only screen and (max-width: 1023px) {
    padding: 1rem 32px;
  }
`;

const SideBar = styled.div<{ offset: number }>`
  position: sticky;
  top: 0px;
  width: 300px;
  height: calc(100dvh - ${(props) => props.offset}px);
  padding: 1.5rem 1rem 0 32px;
  flex-shrink: 0;
  overflow-y: auto;
  border-right: 1px solid ${(props) => props.theme.colors.gray2};
  padding-bottom: 1rem;
`;

const NavigationBar = styled.nav`
  display: flex;
  height: 3rem;
  margin-top: 0.5rem;
  flex-direction: column;
  padding: 0 32px;
  justify-content: flex-end;
`;

const FlexSpaceBetween = styled.div`
  ${flexRowSpaceBetweenStyle}
`;

const StyledButton = styled(Button)`
  &:hover {
    & > span:last-child {
      transition: all 0.3s ease;
      transform: translateX(0.25rem);
    }
  }
`;
