import { ApiOutlined, DesktopOutlined, MobileOutlined, TagsOutlined } from '@ant-design/icons';
import { DeviceBase, PageBase } from '@dogu-private/console';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from 'src/api';
import useEventStore from '../../stores/events';
import MenuLinkTabs, { MenuLinkTabItem, MenuLinkTabProps } from '../MenuLinkTabs';
import ConsoleLayout, { ConsoleLayoutProps } from './ConsoleLayout';
import OrganizationSideBar from './OrganizationSideBar';

interface TabButtonProps {
  selected: boolean;
  href: string;
}

const AddDeviceTabButton = ({ selected, href }: TabButtonProps) => {
  const router = useRouter();
  const [isRefreshEnabled, setIsRefreshEnabled] = useState(true);
  const organizationId = router.query.orgId;
  const { data } = useSWR<PageBase<DeviceBase>>(
    organizationId ? `/organizations/${organizationId}/devices/addable?deviceName=&page=1&offset=10` : null,
    swrAuthFetcher,
    {
      refreshInterval: isRefreshEnabled ? 5000 : undefined,
    },
  );
  const { t } = useTranslation();

  useEffect(() => {
    const unsub = useEventStore.subscribe(({ eventName }) => {
      if (eventName === 'onAddDeviceToProjectModalClosed') {
        setIsRefreshEnabled(true);
      }

      if (eventName === 'onAddDeviceToProjectModalOpened') {
        setIsRefreshEnabled(false);
      }
    });

    return () => {
      unsub();
    };
  }, []);

  return (
    <RelativeBox>
      <MenuLinkTabItem
        selected={selected}
        title={t('device-farm:deviceAddMenuTitle')}
        icon={<ApiOutlined />}
        href={href}
        access-id={'org-add-device-tab'}
      />
      {data && data.totalCount > 0 && <Badge />}
    </RelativeBox>
  );
};

interface Props extends Pick<ConsoleLayoutProps, 'organization' | 'user' | 'license'> {
  children: React.ReactNode;
}

const OrganizationDeviceFarmLayout = ({ children, ...props }: Props) => {
  const router = useRouter();
  const orgId = router.query.orgId;
  const { t } = useTranslation();

  const tabs: MenuLinkTabProps['tabs'] = [
    {
      href: `/dashboard/${orgId}/device-farm/hosts`,
      icon: <DesktopOutlined />,
      title: t('device-farm:hostMenuTitle'),
      'access-id': 'org-host-list-tab',
    },
    {
      href: `/dashboard/${orgId}/device-farm/devices`,
      icon: <MobileOutlined />,
      title: t('device-farm:deviceListMenuTitle'),
      'access-id': 'org-device-list-tab',
    },
    {
      tab: (selected) => (
        <AddDeviceTabButton selected={selected} href={`/dashboard/${orgId}/device-farm/standby-devices`} />
      ),
      href: `/dashboard/${orgId}/device-farm/standby-devices`,
      'access-id': 'org-add-device-tab',
    },
    {
      href: `/dashboard/${orgId}/device-farm/tags`,
      icon: <TagsOutlined />,
      title: t('device-farm:deviceTagMenuTitle'),
      'access-id': 'org-tag-list-tab',
    },
  ];

  return (
    <ConsoleLayout {...props} sidebar={<OrganizationSideBar />} titleI18nKey={'organization:deviceFarmPageTitle'}>
      <MenuLinkTabs tabs={tabs} />
      <Inner>{children}</Inner>
    </ConsoleLayout>
  );
};

export default OrganizationDeviceFarmLayout;

const RelativeBox = styled.div`
  position: relative;
`;

const Badge = styled.div`
  position: absolute;
  top: 3px;
  right: 3px;
  width: 0.5rem;
  height: 0.5rem;
  background-color: #ff0000;
  border-radius: 50%;
  z-index: 1;
`;

const Inner = styled.div`
  margin-top: 24px;
`;
