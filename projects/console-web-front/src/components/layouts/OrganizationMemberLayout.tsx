import { MailOutlined, UserOutlined } from '@ant-design/icons';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import MenuLinkTabs, { MenuLinkTabProps } from '../MenuLinkTabs';
import ConsoleLayout from './ConsoleLayout';
import OrganizationSideBar from './OrganizationSideBar';

interface Props {
  titleI18nKey: string;
  children: React.ReactNode;
  isWebview: boolean;
}

const OrganizationMemberLayout = ({ titleI18nKey, children, isWebview }: Props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const orgId = router.query.orgId;

  const tabs: MenuLinkTabProps['tabs'] = [
    {
      href: `/dashboard/${orgId}/members`,
      icon: <UserOutlined />,
      title: t('org-member:memberLinkButtonTitle'),
    },
    {
      href: `/dashboard/${orgId}/members/invitations`,
      icon: <MailOutlined />,
      title: t('org-member:invitationLinkButtonTitle'),
      'access-id': 'org-invitation-tab',
    },
  ];

  return (
    <ConsoleLayout isWebview={isWebview} titleI18nKey={titleI18nKey} sidebar={<OrganizationSideBar />}>
      <div style={{ marginBottom: '1rem' }}>
        <MenuLinkTabs tabs={tabs} />
      </div>
      {children}
    </ConsoleLayout>
  );
};

export default OrganizationMemberLayout;
