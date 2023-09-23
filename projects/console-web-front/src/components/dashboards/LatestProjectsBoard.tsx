import { PageBase, ProjectBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Card } from 'antd';
import useSWR from 'swr';
import { swrAuthFetcher } from '../../api';
import { DashboardBox, DashboardTitle } from './dashboard.styled';

interface Props {
  organizationId: OrganizationId;
}

const LatestProjectsBoard: React.FC<Props> = ({ organizationId }) => {
  const { data } = useSWR<PageBase<ProjectBase>>(`/organizations/${organizationId}/projects`, swrAuthFetcher);

  return (
    <DashboardBox>
      <DashboardTitle>Latest Projects</DashboardTitle>
      <div>
        {data?.items.map((project) => {
          return <div key={project.projectId}>{project.name}</div>;
        })}
      </div>
    </DashboardBox>
  );
};

export default LatestProjectsBoard;
