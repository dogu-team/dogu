import { useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { LoadingOutlined, PlusCircleOutlined, ProjectOutlined } from '@ant-design/icons';
import { instanceOfUserBase, PageBase, ProjectBase, TeamBase, UserBase } from '@dogu-private/console';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { Avatar, List, Tooltip } from 'antd';
import { OrganizationId } from '@dogu-private/types';
import Link from 'next/link';

import useRefresh from '../../hooks/useRefresh';
import usePaginationSWR from '../../hooks/usePaginationSWR';
import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import { listActiveNameStyle } from '../../styles/text';
import ProfileImage from '../ProfileImage';
import ListEmpty from '../common/boxes/ListEmpty';
import Trans from 'next-translate/Trans';
import { getLocaleFormattedDate } from '../../utils/locale';
import { localizeDate } from '../../utils/date';

interface ProjectItemProps {
  project: ProjectBase;
}

const ProjectItem = ({ project }: ProjectItemProps) => {
  const { t, lang } = useTranslation();

  return (
    <Item>
      <ItemInner>
        <TwoSpan>
          <StyledLink href={`/dashboard/${project.organizationId}/projects/${project.projectId}`}>{project.name}</StyledLink>
        </TwoSpan>
        <TwoSpan>
          <Avatar.Group>
            {project.members?.map((item) => {
              if (instanceOfUserBase(item)) {
                return (
                  <Tooltip key={`project-${project.projectId}-member-${(item as UserBase).userId}`} title={(item as UserBase).name}>
                    <ProfileImage size={32} name={(item as UserBase).name} profileImageUrl={(item as UserBase).profileImageUrl} />
                  </Tooltip>
                );
              }

              return (
                <Tooltip
                  key={`project-${project.projectId}-member-${(item as TeamBase).teamId}`}
                  title={t('organization:projectTeamMemberTooltipTitle', { name: (item as TeamBase).name })}
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
        <OneSpan>{getLocaleFormattedDate(lang, new Date(project.updatedAt))}</OneSpan>
      </ItemInner>
    </Item>
  );
};

interface Props {
  organizationId: OrganizationId;
}

const ProjectListController = ({ organizationId }: Props) => {
  const router = useRouter();
  const { data, isLoading, error, mutate, page, updatePage } = usePaginationSWR<ProjectBase>(`/organizations/${organizationId}/projects`);
  const { t } = useTranslation();

  useRefresh(['onProjectCreated', 'onRefreshClicked'], mutate);

  if (isLoading) {
    return <LoadingOutlined style={{ fontSize: '2rem' }} />;
  }

  return (
    <>
      <Header>
        <ItemInner>
          <TwoSpan>{t('project:projectTableNameColumn')}</TwoSpan>
          <TwoSpan>{t('project:projectTableMembersColumn')}</TwoSpan>
          <OneSpan>{t('project:projectTableLastUpdatedColumn')}</OneSpan>
        </ItemInner>
      </Header>
      <List<ProjectBase>
        dataSource={data?.items}
        renderItem={(item) => <ProjectItem project={item} />}
        loading={isLoading}
        rowKey={(item) => item.projectId}
        pagination={{ defaultCurrent: 1, current: page, pageSize: 10, total: data?.totalCount, onChange: (page, pageSize) => updatePage(page) }}
        locale={{
          emptyText: (
            <ListEmpty
              image={<ProjectOutlined style={{ fontSize: '90px' }} />}
              description={
                <Trans
                  i18nKey="project:projectEmptyDescription"
                  components={{ br: <br />, link: <Link href="https://docs.dogutech.io/organization-and-project/project/about" target="_blank" /> }}
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
