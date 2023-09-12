import { ProjectApplicationWithIcon } from '@dogu-private/console';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { List, MenuProps, Tag } from 'antd';
import { AxiosError } from 'axios';
import moment from 'moment';
import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { AppstoreOutlined } from '@ant-design/icons';
import Trans from 'next-translate/Trans';
import Link from 'next/link';

import { deleteProjectApplication, getProjectApplicationDownloadUrl } from '../../api/project-application';
import usePaginationSWR from '../../hooks/usePaginationSWR';
import useRefresh from '../../hooks/useRefresh';
import useEventStore from '../../stores/events';
import { flexRowBaseStyle, listItemStyle, tableHeaderStyle } from '../../styles/box';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessageFromAxios } from '../../utils/error';
import { convertByteWithMaxUnit } from '../../utils/unit';
import MenuButton from '../buttons/MenuButton';
import MenuItemButton from '../buttons/MenuItemButton';
import ListEmpty from '../common/boxes/ListEmpty';
import ProjectApplicationExtensionTag from './ProjectApplicationExtensionTag';
import ProfileImage from '../../components/ProfileImage';
import ProfileImageWithName from '../users/ProfileImageWithName';

interface ItemProps {
  application: ProjectApplicationWithIcon;
}

const ProjectApplicationItem = ({ application }: ItemProps) => {
  const router = useRouter();
  const fireEvent = useEventStore((state) => state.fireEvent);
  const { t } = useTranslation();

  const handleDowndload = async () => {
    try {
      const url = await getProjectApplicationDownloadUrl(application.organizationId, application.projectId, application.projectApplicationId);
      window.open(url, '_blank');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('project-app:appItemDownloadFailureMessage', { reason: getErrorMessageFromAxios(e) }));
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProjectApplication(application.organizationId, application.projectId, application.projectApplicationId);
      sendSuccessNotification(t('project-app:appItemDeleteSuccessMessage'));
      fireEvent('onProjectApplicationDeleted');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('project-app:appItemDeleteFailureMessage', { reason: getErrorMessageFromAxios(e) }));
      }
    }
  };

  const items: MenuProps['items'] = [
    {
      key: 'download',
      label: (
        <MenuItemButton danger={false} onClick={handleDowndload}>
          {t('project-app:appItemDownloadMenuTitle')}
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
          modalTitle={t('project-app:appItemDeleteConfirmModalTitle')}
          modalButtonTitle={t('project-app:appItemDeleteConfirmModalConfirmButtonTitle')}
          modalContent={t('project-app:appItemDeleteConfirmModalDescription')}
        >
          {t('project-app:appItemDeleteMenuTitle')}
        </MenuItemButton>
      ),
    },
  ];

  return (
    <Item>
      <ItemInner>
        <ThreeSpan>
          <NameWrapper>
            <Image src={application.iconUrl} width={24} height={24} alt={application.name} />
            &nbsp;{application.name}
          </NameWrapper>
        </ThreeSpan>
        <TwoSpan>
          {application.version}
          {application.isLatest === 1 && (
            <Tag style={{ marginLeft: '.5rem' }} color="magenta">
              Latest
            </Tag>
          )}
        </TwoSpan>
        <OneSpan>
          <ProjectApplicationExtensionTag extension={application.fileExtension} />
        </OneSpan>
        <OneSpan>{convertByteWithMaxUnit(application.fileSize)}</OneSpan>
        <OneSpan>
          <ProfileImageWithName
            profileImage={<ProfileImage profileImageUrl={application.creator?.profileImageUrl} name={application.creator?.name} />}
            name={application.creator?.name}
          />
        </OneSpan>
        <OneSpan>
          {new Intl.DateTimeFormat(router.locale, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).format(
            moment(application.updatedAt).toDate(),
          )}
        </OneSpan>
        <Menu>
          <MenuButton menu={{ items }} />
        </Menu>
      </ItemInner>
    </Item>
  );
};

interface Props {
  organizationId: OrganizationId;
  projectId: ProjectId;
}

const ProjectApplicationListController = ({ organizationId, projectId }: Props) => {
  const { data, isLoading, error, updatePage, page, mutate } = usePaginationSWR<ProjectApplicationWithIcon>(
    `/organizations/${organizationId}/projects/${projectId}/applications`,
    undefined,
    { revalidateOnFocus: false },
  );
  const { t } = useTranslation();

  useRefresh(['onRefreshClicked', 'onProjectApplicationUploaded', 'onProjectApplicationDeleted'], () => mutate());

  return (
    <>
      <Header>
        <ItemInner>
          <ThreeSpan>{t('project-app:appTableNameColumn')}</ThreeSpan>
          <TwoSpan>{t('project-app:appTableVersionColumn')}</TwoSpan>
          <OneSpan>{t('project-app:appTableExtensionColumn')}</OneSpan>
          <OneSpan>{t('project-app:appTableSizeColumn')}</OneSpan>
          <OneSpan>{t('project-app:appTableUploader')}</OneSpan>
          <OneSpan>{t('project-app:appTableUploadDateColumn')}</OneSpan>
          <Menu />
        </ItemInner>
      </Header>
      <List<ProjectApplicationWithIcon>
        dataSource={data?.items}
        loading={isLoading}
        renderItem={(item) => <ProjectApplicationItem application={item} />}
        rowKey={(item) => `project-app-${item.projectApplicationId}`}
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
                  i18nKey="project-app:appEmptyDescription"
                  components={{ br: <br />, link: <Link href="https://docs.dogutech.io/management/project/app" target="_blank" /> }}
                />
              }
            />
          ),
        }}
      />
    </>
  );
};

export default ProjectApplicationListController;

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

const Menu = styled(OneSpan)`
  ${flexRowBaseStyle}
  justify-content: flex-end;
`;

const NameWrapper = styled.div`
  ${flexRowBaseStyle}
`;
