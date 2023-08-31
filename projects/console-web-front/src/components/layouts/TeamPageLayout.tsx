import { AppstoreOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { TeamBase } from '@dogu-private/console';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { swrAuthFetcher } from 'src/api';
import styled from 'styled-components';
import useSWR from 'swr';

import MenuLinkTabs, { MenuLinkTabProps } from '../MenuLinkTabs';
import OrganizationSideBar from './OrganizationSideBar';
import ConsoleLayout, { ConsoleLayoutProps } from './ConsoleLayout';

interface Props extends Pick<ConsoleLayoutProps, 'organization' | 'children'> {}

const TeamPageLayout = ({ children, organization }: Props) => {
  const router = useRouter();
  const orgId = router.query.orgId;
  const teamId = router.query.teamId;
  const { data, error, isLoading } = useSWR<TeamBase>(`/organizations/${orgId}/teams/${teamId}`, swrAuthFetcher);
  const { t } = useTranslation();

  const tabs: MenuLinkTabProps['tabs'] = [
    {
      href: `/dashboard/${orgId}/teams/${teamId}/members`,
      icon: <UserOutlined />,
      title: t('team:teamDetailPageMemberTab'),
      'access-id': 'team-member-tab',
    },
    {
      href: `/dashboard/${orgId}/teams/${teamId}/projects`,
      icon: <AppstoreOutlined />,
      title: t('team:teamDetailPageProjectTab'),
      'access-id': 'team-project-tab',
    },
    {
      href: `/dashboard/${orgId}/teams/${teamId}/settings`,
      icon: <SettingOutlined />,
      title: t('team:teamDetailPageSettingTab'),
      'access-id': 'team-setting-tab',
    },
  ];

  if (!isLoading && (error || !data)) {
    return null;
  }

  return (
    <ConsoleLayout organization={organization} sidebar={<OrganizationSideBar />} title={t('team:teamDetailPageTitle', { name: data?.name ?? '' })}>
      <Box>
        <MenuLinkTabs tabs={tabs} />
        <Inner>{children}</Inner>
      </Box>
    </ConsoleLayout>
  );
};

export default TeamPageLayout;

const Box = styled.div``;

const Inner = styled.div`
  margin-top: 24px;
`;
