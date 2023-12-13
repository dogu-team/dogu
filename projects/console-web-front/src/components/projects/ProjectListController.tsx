import useTranslation from 'next-translate/useTranslation';
import { CopyOutlined, LoadingOutlined, ProjectOutlined } from '@ant-design/icons';
import { ProjectBase } from '@dogu-private/console';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { List, MenuProps, message } from 'antd';
import { OrganizationId, PROJECT_TYPE } from '@dogu-private/types';
import Link from 'next/link';
import Trans from 'next-translate/Trans';
import { isAxiosError } from 'axios';

import useRefresh from '../../hooks/useRefresh';
import usePaginationSWR from '../../hooks/usePaginationSWR';
import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import { listActiveNameStyle } from '../../styles/text';
import ListEmpty from '../common/boxes/ListEmpty';
import MenuButton from '../buttons/MenuButton';
import MenuItemButton from '../buttons/MenuItemButton';
import { deleteProject } from '../../api/project';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessageFromAxios } from '../../utils/error';
import useEventStore from 'src/stores/events';
import useModal from '../../hooks/useModal';
import ProjectAccessTokenModal from './ProjectAccessTokenModal';
import ProjectEditModal from './ProjectEditModal';
import { DoguDocsUrl } from '../../utils/url';

interface ProjectItemProps {
  project: ProjectBase;
}

const ProjectItem = ({ project }: ProjectItemProps) => {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const fireEvent = useEventStore((state) => state.fireEvent);
  const [isOpenTokenModal, openTokenModal, closeTokenModal] = useModal();
  const [isOpenEditModal, openEditModal, clsoeEditModal] = useModal();

  const getTypeText = (type: PROJECT_TYPE) => {
    switch (type) {
      case PROJECT_TYPE.WEB:
        return 'Web';
      case PROJECT_TYPE.APP:
        return 'Mobile App';
      case PROJECT_TYPE.GAME:
        return 'Game';
      case PROJECT_TYPE.CUSTOM:
        return 'Custom';
      default:
        return '';
    }
  };

  const copyProjectId = async () => {
    try {
      await navigator.clipboard.writeText(project.projectId);
      message.success(t('common:copyClipboard'));
    } catch (e) {
      message.error(t('common:copyClipboardFailed'));
    }
  };

  const handleDeleteProject = async () => {
    try {
      await deleteProject(project.organizationId, project.projectId);
      sendSuccessNotification('Deleted!');
      fireEvent('onProjectDeleted');
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(`Failed to delete project.\n${getErrorMessageFromAxios(e)}`);
      }
    }
  };

  const items: MenuProps['items'] = [
    {
      label: (
        <MenuItemButton danger={false} onClick={() => openTokenModal()}>
          Show access token
        </MenuItemButton>
      ),
      key: 'access-token',
    },
    {
      label: (
        <MenuItemButton danger={false} onClick={() => openEditModal()}>
          Edit
        </MenuItemButton>
      ),
      key: 'Edit',
    },
    {
      type: 'divider',
    },
    {
      label: (
        <MenuItemButton
          danger
          modalTitle="Delete project"
          modalButtonTitle="Confirm & Delete"
          modalContent={'Are you sure to delete this project? This cannot be undone.'}
          onConfirm={handleDeleteProject}
        >
          Delete
        </MenuItemButton>
      ),
      key: 'delete',
    },
  ];

  return (
    <>
      <Item>
        <ItemInner>
          <TwoSpan>
            <StyledLink href={`${router.asPath}/${project.projectId}/routines`}>{project.name}</StyledLink>
          </TwoSpan>
          <TwoSpan>
            <StyledProjectId onClick={copyProjectId}>
              {project.projectId}{' '}
              <i>
                <CopyOutlined />
              </i>
            </StyledProjectId>
          </TwoSpan>
          <ButtonWrapper>
            <MenuButton menu={{ items }} />
          </ButtonWrapper>
        </ItemInner>
      </Item>

      <ProjectAccessTokenModal
        isOpen={isOpenTokenModal}
        close={closeTokenModal}
        organizationId={project.organizationId}
        projectId={project.projectId}
      />
      <ProjectEditModal isOpen={isOpenEditModal} close={clsoeEditModal} project={project} />
    </>
  );
};

interface Props {
  organizationId: OrganizationId;
  projectType?: PROJECT_TYPE;
}

const ProjectListController = ({ organizationId, projectType }: Props) => {
  const router = useRouter();
  const { data, isLoading, error, mutate, page, updatePage } = usePaginationSWR<ProjectBase>(
    `/organizations/${organizationId}/projects${projectType !== undefined ? `?type=${projectType}` : ''}`,
    { skipQuestionMark: projectType !== undefined },
    { revalidateOnFocus: false },
  );
  const { t } = useTranslation();

  useRefresh(['onProjectCreated', 'onRefreshClicked', 'onProjectDeleted', 'onProjectUpdated'], () => mutate());

  if (isLoading) {
    return <LoadingOutlined style={{ fontSize: '2rem' }} />;
  }

  return (
    <>
      <Header>
        <ItemInner>
          <TwoSpan>{t('project:projectTableNameColumn')}</TwoSpan>
          <TwoSpan>ID</TwoSpan>
          <ButtonWrapper />
        </ItemInner>
      </Header>
      <List<ProjectBase>
        access-id="project-list"
        dataSource={data?.items}
        renderItem={(item) => <ProjectItem project={item} />}
        loading={isLoading}
        rowKey={(item) => item.projectId}
        pagination={{
          defaultCurrent: 1,
          current: page,
          pageSize: 10,
          total: data?.totalCount,
          onChange: (page, pageSize) => updatePage(page),
        }}
        locale={{
          emptyText: (
            <ListEmpty
              image={<ProjectOutlined style={{ fontSize: '90px' }} />}
              description={
                <Trans
                  i18nKey="project:projectEmptyDescription"
                  components={{
                    br: <br />,
                    link: <Link href={DoguDocsUrl['get-started'].tutorials['test-automation']()} target="_blank" />,
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

export default ProjectListController;

const Item = styled(List.Item)`
  ${listItemStyle}
`;

const Header = styled.div`
  ${tableHeaderStyle}
`;

const ItemInner = styled.div`
  ${flexRowBaseStyle}
`;

const ThreeSpan = styled.div`
  ${tableCellStyle}
  flex: 3;
`;

const TwoSpan = styled.div`
  ${tableCellStyle}
  flex: 2;
`;

const OneSpan = styled.div`
  ${tableCellStyle}
  flex: 1;
`;

const StyledLink = styled(Link)`
  ${listActiveNameStyle}

  &:hover {
    text-decoration: underline;
  }
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const ButtonWrapper = styled.div`
  ${flexRowBaseStyle}
  width: 48px;
  justify-content: flex-end;
  flex-shrink: 0;
`;

const StyledProjectId = styled.span`
  cursor: pointer;

  i {
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover i {
    opacity: 1;
  }
`;
