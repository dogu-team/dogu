import { TagsOutlined } from '@ant-design/icons';
import { PageBase, DeviceTagBase } from '@dogu-private/console';
import { OrganizationId, Platform, platformFromPlatformType, PlatformType } from '@dogu-private/types';
import { List, MenuProps, Tag } from 'antd';
import { AxiosError } from 'axios';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import styled from 'styled-components';
import { KeyedMutator } from 'swr';

import { deleteTag } from '../../api/tag';
import useModal from '../../hooks/useModal';
import usePaginationSWR from '../../hooks/usePaginationSWR';
import useRefresh from '../../hooks/useRefresh';
import useTagFilterStore from '../../stores/tag-filter';
import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessage } from '../../utils/error';
import MenuButton from '../buttons/MenuButton';
import MenuItemButton from '../buttons/MenuItemButton';
import ListEmpty from '../common/boxes/ListEmpty';
import EditTagModal from './EditTagModal';

interface TagItemProps {
  tag: DeviceTagBase;
  mutateTags: KeyedMutator<PageBase<DeviceTagBase>>;
}

const TagItem = ({ tag, mutateTags }: TagItemProps) => {
  const [isEditModalOpen, openEditModal, closeEditModal] = useModal();
  const router = useRouter();
  const orgId = router.query.orgId as OrganizationId;
  const { t } = useTranslation();

  const isPlatformTag = platformFromPlatformType(tag.name as PlatformType) !== Platform.PLATFORM_UNSPECIFIED;

  const handleDelete = async () => {
    try {
      await deleteTag(orgId, tag.deviceTagId);
      mutateTags();
      sendSuccessNotification(t('device:tagDeleteSuccessMsg'));
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('device:tagDeleteFailMsg', { reason: getErrorMessage(e) }));
      }
    }
  };

  const items: MenuProps['items'] = [
    {
      label: (
        <MenuItemButton danger={false} onClick={() => openEditModal()}>
          {t('device:tagItemEditMenu')}
        </MenuItemButton>
      ),
      key: 'edit',
    },
    { type: 'divider' },
    {
      label: (
        <MenuItemButton
          danger
          onClick={handleDelete}
          modalTitle={t('device:tagDeleteModalTitle')}
          modalButtonTitle={t('device:tagDeleteModalButtonText')}
          modalContent={
            <p>
              {t('device:tagDeleteModalContentWaningMsg')}
              <Trans
                i18nKey={tag.devices!.length < 2 ? 'device:tagDeleteModalContentTextSingular' : 'device:tagDeleteModalContentTextPlurar'}
                components={[<b style={{ fontWeight: '500' }} key="tag-count" />]}
                values={{ count: tag.devices?.length }}
              />
            </p>
          }
          onConfirm={handleDelete}
          confirmButtonId="tag-delete-confirm-btn"
        >
          {t('device:tagItemDeleteMenu')}
        </MenuItemButton>
      ),
      key: 'delete',
    },
  ];

  return (
    <>
      <Item>
        <FlexRowBase>
          <NameCell>{tag.name}</NameCell>
          <DeviceCell>
            <FlexRowBase style={{ paddingTop: '.25rem' }}>
              {tag.devices?.map((item) => {
                return (
                  <Tag key={`tag-${tag.deviceTagId}-device-${item.deviceId}`} style={{ marginBottom: '.25rem' }}>
                    {item.name}
                  </Tag>
                );
              })}
            </FlexRowBase>
          </DeviceCell>
          <MenuCell>
            {!isPlatformTag && (
              <FlexEndBox>
                <MenuButton menu={{ items }} destroyPopupOnHide />
              </FlexEndBox>
            )}
          </MenuCell>
        </FlexRowBase>
      </Item>

      <EditTagModal tag={tag} isOpen={isEditModalOpen} closeModal={closeEditModal} />
    </>
  );
};

interface Props {
  organizationId: OrganizationId;
}

const DeviceTagListController = ({ organizationId }: Props) => {
  const { keyword } = useTagFilterStore((state) => state.filterValue);
  const { data, error, mutate, page, updatePage, isLoading } = usePaginationSWR<DeviceTagBase>(`/organizations/${organizationId}/tags?keyword=${keyword}`, {
    skipQuestionMark: true,
  });
  const { t } = useTranslation();

  useRefresh(['onRefreshClicked', 'onTagCreated', 'onTagEdited'], mutate);

  return (
    <>
      <Header>
        <FlexRowBase>
          <NameCell>{t('device:tagTableNameColumn')}</NameCell>
          <DeviceCell>{t('device:tagTableTaggedDeviceColumn')}</DeviceCell>
          <MenuCell></MenuCell>
        </FlexRowBase>
      </Header>
      <List<DeviceTagBase>
        dataSource={data?.items}
        loading={isLoading}
        pagination={{ defaultCurrent: 1, current: page, pageSize: 10, total: data?.totalCount, onChange: (page, pageSize) => updatePage(page) }}
        renderItem={(item) => <TagItem tag={item} mutateTags={mutate} />}
        rowKey={(record) => `tag-${record.deviceTagId}`}
        locale={{
          emptyText: (
            <ListEmpty
              image={<TagsOutlined style={{ fontSize: '90px' }} />}
              description={
                <Trans
                  i18nKey="device:tagEmptyDescription"
                  components={{ br: <br />, link: <Link href="https://docs.dogutech.io/management/organization/device/tag-management" target="_blank" /> }}
                />
              }
            />
          ),
        }}
      />
    </>
  );
};

export default React.memo(DeviceTagListController);

const TaggedDeviceBox = styled.div`
  display: flex;
  align-items: center;
`;

const StyledTaggedDevice = styled.div`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid ${(props) => props.theme.colors.gray3};
  font-size: 0.9rem;
  margin: 2px;
`;

const Item = styled(List.Item)`
  ${listItemStyle}
`;

const FlexRowBase = styled.div`
  ${flexRowBaseStyle}
  flex-wrap: wrap;
`;

const Header = styled.div`
  ${tableHeaderStyle}
`;

const NameCell = styled.div`
  ${tableCellStyle}
  flex: 4;
`;

const DeviceCell = styled.div`
  ${tableCellStyle}
  flex: 2;
`;

const MenuCell = styled.div`
  ${tableCellStyle}
  flex:1;
  margin-right: 0;
`;

const FlexEndBox = styled(FlexRowBase)`
  justify-content: flex-end;
`;
