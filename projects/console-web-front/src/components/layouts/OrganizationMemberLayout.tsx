import { MailOutlined, UserOutlined } from '@ant-design/icons';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import MenuLinkTabs, { MenuLinkTabProps } from '../MenuLinkTabs';
import ConsoleLayout, { ConsoleLayoutProps } from './ConsoleLayout';
import OrganizationSideBar from './OrganizationSideBar';

interface Props extends Pick<ConsoleLayoutProps, 'organization' | 'titleI18nKey' | 'children'> {}

const OrganizationMemberLayout = (props: Props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const orgId = router.query.orgId;

  const tabs: MenuLinkTabProps['tabs'] = [
    {
      href: `/dashboard/${orgId}/members`,
      icon: <UserOutlined />,
      title: t('org-member:memberLinkButtonTitle'),
      'access-id': 'org-member-tab',
    },
    {
      href: `/dashboard/${orgId}/members/invitations`,
      icon: <MailOutlined />,
      title: t('org-member:invitationLinkButtonTitle'),
      'access-id': 'org-invitation-tab',
    },
  ];

  return (
    <ConsoleLayout
      titleI18nKey={props.titleI18nKey}
      organization={props.organization}
      sidebar={<OrganizationSideBar />}
    >
      <div style={{ marginBottom: '1rem' }}>
        <MenuLinkTabs tabs={tabs} />
      </div>
      {props.children}
    </ConsoleLayout>
  );
};

export default OrganizationMemberLayout;
