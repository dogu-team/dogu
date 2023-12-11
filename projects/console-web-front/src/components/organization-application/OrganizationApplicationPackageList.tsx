import { OrganizationApplicationWithIcon } from '@dogu-private/console';
import { List, MenuProps } from 'antd';
import { isAxiosError } from 'axios';
import moment from 'moment';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import {
  deleteOrganizationApplication,
  getOrganizationApplicationDownloadUrl,
} from '../../api/organization-application';

import usePaginationSWR from '../../hooks/usePaginationSWR';
import useRefresh from '../../hooks/useRefresh';
import useEventStore from '../../stores/events';
import { flexRowBaseStyle, listItemStyle, tableHeaderStyle } from '../../styles/box';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessageFromAxios } from '../../utils/error';
import { convertByteWithMaxUnit } from '../../utils/unit';
import MenuButton from '../buttons/MenuButton';
import MenuItemButton from '../buttons/MenuItemButton';
import ProfileImage from '../ProfileImage';
import ProfileImageWithName from '../users/ProfileImageWithName';
import OrganizationApplicationLatestTag from './OrganizationApplicationLatestTag';

interface ItemProps {
  app: OrganizationApplicationWithIcon;
}

const AppItem: React.FC<ItemProps> = ({ app }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const fireEvent = useEventStore((state) => state.fireEvent);

  const handleDowndload = async () => {
    try {
      const url = await getOrganizationApplicationDownloadUrl(app.organizationId, app.organizationApplicationId);
      window.open(url, '_blank');
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(
          t('organization-app:appItemDownloadFailureMessage', { reason: getErrorMessageFromAxios(e) }),
        );
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOrganizationApplication(app.organizationId, app.organizationApplicationId);
      sendSuccessNotification(t('organization-app:appItemDeleteSuccessMessage'));
      fireEvent('onProjectApplicationDeleted');
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(
          t('organization-app:appItemDeleteFailureMessage', { reason: getErrorMessageFromAxios(e) }),
        );
      }
    }
  };

  const items: MenuProps['items'] = [
    {
      key: 'download',
      label: (
        <MenuItemButton danger={false} onClick={handleDowndload}>
          {t('organization-app:appItemDownloadMenuTitle')}
        </MenuItemButton>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: (
        <MenuItemButton
          danger
          onConfirm={handleDelete}
          modalTitle={t('organization-app:appItemDeleteConfirmModalTitle')}
          modalButtonTitle={t('organization-app:appItemDeleteConfirmModalConfirmButtonTitle')}
          modalContent={t('organization-app:appItemDeleteConfirmModalDescription')}
        >
          {t('organization-app:appItemDeleteMenuTitle')}
        </MenuItemButton>
      ),
    },
  ];

  return (
    <Item>
      <ItemInner>
        <TwoSpan>
          <FlexRow>
            {!!app.isLatest && <OrganizationApplicationLatestTag />}
            <div>
              <p>Version: {app.version}</p>
              <p>Build Version: {app.versionCode}</p>
            </div>
          </FlexRow>
        </TwoSpan>
        <OneSpan>{convertByteWithMaxUnit(app.fileSize)}</OneSpan>
        <OneSpan>
          <ProfileImageWithName
            profileImage={<ProfileImage profileImageUrl={app.creator?.profileImageUrl} name={app.creator?.name} />}
            name={app.creator?.name}
          />
        </OneSpan>
        <OneSpan>
          {new Intl.DateTimeFormat(router.locale, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
          }).format(moment(app.createdAt).toDate())}
        </OneSpan>
        <ButtonWrapper>
          <MenuButton menu={{ items }} />
        </ButtonWrapper>
      </ItemInner>
    </Item>
  );
};

interface Props {
  app: OrganizationApplicationWithIcon;
}

export const OrganizationApplicationPackageList: React.FC<Props> = ({ app }) => {
  const { data, isLoading, error, updatePage, page, mutate } = usePaginationSWR<OrganizationApplicationWithIcon>(
    `/organizations/${app.organizationId}/applications/packages/${app.package}?extension=${app.fileExtension}`,
    { skipQuestionMark: true },
    { revalidateOnFocus: false },
  );
  const { t } = useTranslation();

  useRefresh(['onProjectApplicationDeleted'], () => mutate());

  return (
    <>
      <Header>
        <ItemInner>
          <TwoSpan>{t('organization-app:appTableVersionColumn')}</TwoSpan>
          <OneSpan>{t('organization-app:appTableSizeColumn')}</OneSpan>
          <OneSpan>{t('organization-app:appTableUploader')}</OneSpan>
          <OneSpan>{t('organization-app:appTableUploadDateColumn')}</OneSpan>
          <ButtonWrapper></ButtonWrapper>
        </ItemInner>
      </Header>
      <List<OrganizationApplicationWithIcon>
        dataSource={data?.items}
        loading={isLoading}
        renderItem={(item) => <AppItem app={item} />}
        rowKey={(item) => `org-app-package-${item.organizationApplicationId}`}
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
      />
    </>
  );
};

export default OrganizationApplicationPackageList;

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

const TwoSpan = styled(Cell)`
  flex: 2;
`;

const OneSpan = styled(Cell)`
  flex: 1;
`;

const NameWrapper = styled.div`
  ${flexRowBaseStyle}

  .package {
    font-size: 0.8rem;
    color: #888;
  }
`;

const ButtonWrapper = styled.div`
  width: 48px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;
