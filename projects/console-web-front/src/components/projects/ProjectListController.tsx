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

interface ProjectItemProps {
  project: ProjectBase;
}

const ProjectItem = ({ project }: ProjectItemProps) => {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const fireEvent = useEventStore((state) => state.fireEvent);

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
    // {
    //   label: (
    //     <MenuItemButton danger={false} onClick={copyProjectId}>
    //       Copy project ID
    //     </MenuItemButton>
    //   ),
    //   key: 'copy-id',
    // },
    // {
    //   type: 'divider',
    // },
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
        {/* <OneSpan>
          <FlexRow>
            <ProjectTypeIcon type={project.type} style={{ fontSize: '1.1rem', marginRight: '.25rem' }} />
            <p>{getTypeText(project.type)}</p>
          </FlexRow>
        </OneSpan> */}
        {/* <TwoSpan>
          <Avatar.Group>
            {project.members?.map((item) => {
              if (instanceOfUserBase(item)) {
                return (
                  <Tooltip
                    key={`project-${project.projectId}-member-${(item as UserBase).userId}`}
                    title={(item as UserBase).name}
                  >
                    <ProfileImage
                      size={32}
                      name={(item as UserBase).name}
                      profileImageUrl={(item as UserBase).profileImageUrl}
                    />
                  </Tooltip>
                );
              }

              return (
                <Tooltip
                  key={`project-${project.projectId}-member-${(item as TeamBase).teamId}`}
                  title={t('organization:projectTeamMemberTooltipTitle', {
                    name: (item as TeamBase).name,
                  })}
                >
                  <ProfileImage size={32} name={(item as TeamBase).name} profileImageUrl={null} />
                </Tooltip>
              );
            })}

            {!!project.members?.length && project.members?.length > 5 && (
              <Avatar size={32} style={{ backgroundColor: '#40a9ff', fontSize: '0.9rem' }}>
                +{project.members?.length - 5}
              </Avatar>
            )}
          </Avatar.Group>
        </TwoSpan>
        <OneSpan>{getLocaleFormattedDate(lang, new Date(project.updatedAt))}</OneSpan> */}
        <ButtonWrapper>
          <MenuButton menu={{ items }} />
        </ButtonWrapper>
      </ItemInner>
    </Item>
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
  );
  const { t } = useTranslation();

  useRefresh(['onProjectCreated', 'onRefreshClicked', 'onProjectDeleted'], () => mutate());

  if (isLoading) {
    return <LoadingOutlined style={{ fontSize: '2rem' }} />;
  }

  return (
    <>
      <Header>
        <ItemInner>
          <TwoSpan>{t('project:projectTableNameColumn')}</TwoSpan>
          <TwoSpan>ID</TwoSpan>
          {/* <TwoSpan>{t('project:projectTableMembersColumn')}</TwoSpan>
          <OneSpan>{t('project:projectTableLastUpdatedColumn')}</OneSpan> */}
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
                    tutorialLink: <Link href={`/dashboard/${router.query.orgId}/get-started`} />,
                    link: <Link href="https://docs.dogutech.io/management/project" target="_blank" />,
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
