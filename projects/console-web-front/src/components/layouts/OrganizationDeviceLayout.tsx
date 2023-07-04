import { ApiOutlined, CloudOutlined, MobileOutlined, TagsOutlined } from '@ant-design/icons';
import { DeviceBase, PageBase } from '@dogu-private/console';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { swrAuthFetcher } from 'src/api';
import styled from 'styled-components';
import useSWR from 'swr';

import useEventStore from '../../stores/events';
import MenuLinkTabs, { MenuLinkTabItem, MenuLinkTabProps } from '../MenuLinkTabs';
import ConsoleLayout from './ConsoleLayout';
import OrganizationSideBar from './OrganizationSideBar';

interface TabButtonProps {
  selected: boolean;
  href: string;
}

const AddDeviceTabButton = ({ selected, href }: TabButtonProps) => {
  const router = useRouter();
  const [isRefreshEnabled, setIsRefreshEnabled] = useState(true);
  const organizationId = router.query.orgId;
  const { data } = useSWR<PageBase<DeviceBase>>(organizationId ? `/organizations/${organizationId}/devices/addable?deviceName=&page=1&offset=10` : null, swrAuthFetcher, {
    refreshInterval: isRefreshEnabled ? 5000 : undefined,
  });
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
      <MenuLinkTabItem selected={selected} title={t('device:deviceAddMenuTitle')} icon={<ApiOutlined />} href={href} access-id={'org-add-device-tab'} />
      {data && data.totalCount > 0 && <Badge />}
    </RelativeBox>
  );
};

interface Props {
  children: React.ReactNode;
}

const OrganizationDeviceLayout = ({ children }: Props) => {
  const router = useRouter();
  const orgId = router.query.orgId;
  const { t } = useTranslation();

  const tabs: MenuLinkTabProps['tabs'] = [
    {
      href: `/dashboard/${orgId}/devices`,
      icon: <MobileOutlined />,
      title: t('device:deviceListMenuTitle'),
      'access-id': 'org-device-list-tab',
    },
    {
      tab: (selected) => <AddDeviceTabButton selected={selected} href={`/dashboard/${orgId}/devices/standby`} />,
      href: `/dashboard/${orgId}/devices/standby`,
    },
    // {
    //   href: `/dashboard/${orgId}/devices/cloud`,
    //   icon: <CloudOutlined />,
    //   title: '클라우드 디바이스',
    //   'access-id': 'org-add-cloud-device-tab',
    // },
    {
      href: `/dashboard/${orgId}/devices/tags`,
      icon: <TagsOutlined />,
      title: t('device:deviceTagMenuTitle'),
      'access-id': 'org-tag-list-tab',
    },
  ];

  return (
    <ConsoleLayout sidebar={<OrganizationSideBar />} titleI18nKey={'organization:devicePageTitle'}>
      <MenuLinkTabs tabs={tabs} />
      <Inner>{children}</Inner>
    </ConsoleLayout>
  );
};

export default OrganizationDeviceLayout;

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
