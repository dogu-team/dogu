import { AppstoreOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { TeamBase } from '@dogu-private/console';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { swrAuthFetcher } from 'src/api';
import styled from 'styled-components';
import useSWR from 'swr';

import H4 from '../common/headings/H4';
import MenuLinkTabs, { MenuLinkTabProps } from '../MenuLinkTabs';
import OrganizationSideBar from './OrganizationSideBar';
import ConsoleLayout from './ConsoleLayout';

interface Props {
  children: React.ReactNode;
  isWebview: boolean;
}

const TeamPageLayout = ({ children, isWebview }: Props) => {
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
    },
    {
      href: `/dashboard/${orgId}/teams/${teamId}/projects`,
      icon: <AppstoreOutlined />,
      title: t('team:teamDetailPageProjectTab'),
    },
    {
      href: `/dashboard/${orgId}/teams/${teamId}/settings`,
      icon: <SettingOutlined />,
      title: t('team:teamDetailPageSettingTab'),
    },
  ];

  if (!isLoading && (error || !data)) {
    return null;
  }

  return (
    <ConsoleLayout isWebview={isWebview} sidebar={<OrganizationSideBar />} title={t('team:teamDetailPageTitle', { name: data?.name ?? '' })}>
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
