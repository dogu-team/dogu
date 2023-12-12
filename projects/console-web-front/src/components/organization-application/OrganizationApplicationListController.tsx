import { OrganizationApplicationWithIcon } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { List, MenuProps, Modal } from 'antd';
import { isAxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';
import styled from 'styled-components';
import { AppstoreOutlined } from '@ant-design/icons';
import Trans from 'next-translate/Trans';
import Link from 'next/link';

import usePaginationSWR from '../../hooks/usePaginationSWR';
import useRefresh from '../../hooks/useRefresh';
import useEventStore from '../../stores/events';
import { flexRowBaseStyle, listItemStyle, tableHeaderStyle } from '../../styles/box';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessageFromAxios } from '../../utils/error';
import MenuButton from '../buttons/MenuButton';
import MenuItemButton from '../buttons/MenuItemButton';
import ListEmpty from '../common/boxes/ListEmpty';
import OrganizationApplicationExtensionTag from './OrganizationApplicationExtensionTag';
import { listActiveNameStyle } from '../../styles/text';
import useModal from '../../hooks/useModal';
import OrganizationApplicationPackageList from './OrganizationApplicationPackageList';
import { deleteOrganizationApplicationByPackageName } from '../../api/organization-application';
import { useRouter } from 'next/router';
import moment from 'moment';
import { DoguDocsUrl } from '../../utils/url';

interface ItemProps {
  application: OrganizationApplicationWithIcon;
}

const OrganizationApplicationItem = ({ application }: ItemProps) => {
  const fireEvent = useEventStore((state) => state.fireEvent);
  const [isOpen, openModal, closeModal] = useModal();
  const { t } = useTranslation();
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await deleteOrganizationApplicationByPackageName(application.organizationId, application.package);
      sendSuccessNotification(t('organization-app:appPackageItemDeleteSuccessMessage'));
      fireEvent('onProjectApplicationDeleted');
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(
          t('organization-app:appPackageItemDeleteFailureMessage', { reason: getErrorMessageFromAxios(e) }),
        );
      }
    }
  };

  const items: MenuProps['items'] = [
    {
      key: 'delete',
      label: (
        <MenuItemButton
          danger
          onConfirm={handleDelete}
          modalTitle={t('organization-app:appPackageItemDeleteConfirmModalTitle')}
          modalButtonTitle={t('organization-app:appPackageItemDeleteConfirmModalConfirmButtonTitle')}
          modalContent={t('organization-app:appPackageItemDeleteConfirmModalDescription', {
            packageName: application.package,
          })}
        >
          {t('organization-app:appPackageItemDeleteMenuTitle')}
        </MenuItemButton>
      ),
    },
  ];

  return (
    <>
      <Item>
        <ItemInner>
          <ThreeSpan>
            <NameWrapper>
              <Image
                src={application.iconUrl}
                width={24}
                height={24}
                alt={application.name}
                style={{ marginRight: '.5rem' }}
              />
              <AppName onClick={() => openModal()}>{application.name}</AppName>
            </NameWrapper>
          </ThreeSpan>
          <TwoSpan>{application.package}</TwoSpan>
          <OneSpan>
            <OrganizationApplicationExtensionTag extension={application.fileExtension} />
          </OneSpan>
          <TwoSpan>
            {new Intl.DateTimeFormat(router.locale, {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
            }).format(moment(application.createdAt).toDate())}
          </TwoSpan>
          <Menu>
            <MenuButton menu={{ items }} />
          </Menu>
        </ItemInner>
      </Item>

      <Modal
        open={isOpen}
        closable
        onCancel={closeModal}
        destroyOnClose
        centered
        width={850}
        footer={null}
        title={
          <FlexRow>
            <Image
              src={application.iconUrl}
              width={28}
              height={28}
              alt={application.name}
              style={{ marginRight: '.5rem' }}
            />
            {application.name}
          </FlexRow>
        }
      >
        <div style={{ marginTop: '1rem' }}>
          <OrganizationApplicationPackageList app={application} />
        </div>
      </Modal>
    </>
  );
};

interface Props {
  organizationId: OrganizationId;
}

const OrganizationApplicationListController = ({ organizationId }: Props) => {
  const { data, isLoading, error, updatePage, page, mutate } = usePaginationSWR<OrganizationApplicationWithIcon>(
    `/organizations/${organizationId}/applications/packages`,
    undefined,
    { revalidateOnFocus: false },
  );
  const { t } = useTranslation();

  useRefresh(['onRefreshClicked', 'onProjectApplicationUploaded', 'onProjectApplicationDeleted'], () => mutate());

  return (
    <>
      <Header>
        <ItemInner>
          <ThreeSpan>{t('organization-app:appTableNameColumn')}</ThreeSpan>
          <TwoSpan>{t('organization-app:appTablePackageNameColumn')}</TwoSpan>
          <OneSpan>{t('organization-app:appTableExtensionColumn')}</OneSpan>
          <TwoSpan>{t('organization-app:appTableUploadDateColumn')}</TwoSpan>
          <Menu />
        </ItemInner>
      </Header>
      <List<OrganizationApplicationWithIcon>
        dataSource={data?.items}
        loading={isLoading}
        renderItem={(item) => <OrganizationApplicationItem application={item} />}
        rowKey={(item) => `org-app-${item.organizationApplicationId}`}
        pagination={{
          defaultCurrent: 1,
          current: page,
          onChange: (p) => {
            scrollTo(0, 0);
            updatePage(p);
          },
          pageSize: 10,
          total: data?.totalCount,
        }}
        locale={{
          emptyText: (
            <ListEmpty
              image={<AppstoreOutlined style={{ fontSize: '5rem' }} />}
              description={
                <Trans
                  i18nKey="organization-app:appEmptyDescription"
                  components={{
                    br: <br />,
                    link: <Link href={DoguDocsUrl.management.organization.app()} target="_blank" />,
                  }}
                />
              }
            />
          ),
        }}
      />
    </>
  );
};

export default OrganizationApplicationListController;

const Header = styled.div`
  ${tableHeaderStyle}
`;

const Item = styled(List.Item)`
  ${listItemStyle}
`;

const ItemInner = styled.div`
  ${flexRowBaseStyle}

  & > *:last-child {
    margin-right: 0;
  }
`;

const Cell = styled.div`
  margin-right: 1rem;
`;

const ThreeSpan = styled(Cell)`
  flex: 3;
`;

const TwoSpan = styled(Cell)`
  flex: 2;
`;

const OneSpan = styled(Cell)`
  flex: 1;
`;

const Menu = styled.div`
  width: 48px;
  ${flexRowBaseStyle}
  justify-content: flex-end;
`;

const NameWrapper = styled.div`
  ${flexRowBaseStyle}
`;

const AppName = styled.p`
  ${listActiveNameStyle}
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;
