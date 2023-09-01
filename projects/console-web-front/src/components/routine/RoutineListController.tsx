import { LoadingOutlined } from '@ant-design/icons';
import { RoutineBase } from '@dogu-private/console';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { isAxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import useRefresh from '../../hooks/useRefresh';
import { getErrorMessageFromAxios } from '../../utils/error';
import ErrorBox from '../common/boxes/ErrorBox';
import ProjectSidebarItem from '../projects/ProjectSidebarItem';

interface Props {
  organizationId: OrganizationId;
  projectId: ProjectId;
}

const RoutineListController = ({ organizationId, projectId }: Props) => {
  const router = useRouter();
  const { data, isLoading, error, mutate } = useSWR<RoutineBase[]>(`/organizations/${organizationId}/projects/${projectId}/routines?name=`, swrAuthFetcher);
  const { t } = useTranslation();

  useRefresh(['onRoutineCreated', 'onRoutineDeleted'], () => mutate());

  if (isLoading) {
    return <LoadingOutlined />;
  }

  if (!data || error) {
    return <ErrorBox title="Something went wrong" desc={isAxiosError(error) ? getErrorMessageFromAxios(error) : 'Cannot find routines information'} />;
  }

  return (
    <Box>
      <ProjectSidebarItem
        href={`/dashboard/${organizationId}/projects/${projectId}/routines`}
        selected={router.query.routine === undefined && router.query.routineId === undefined}
      >
        {t('routine:routineSidebarAllMenuTitle')}
      </ProjectSidebarItem>
      <Divider />
      {data.map((item) => {
        return (
          <ProjectSidebarItem
            key={`project-${projectId}-${item.routineId}`}
            href={`/dashboard/${organizationId}/projects/${projectId}/routines?routine=${item.routineId}`}
            selected={router.query.routine === item.routineId || router.query.routineId === item.routineId}
          >
            {item.name}
          </ProjectSidebarItem>
        );
      })}
    </Box>
  );
};

export default RoutineListController;

const Box = styled.div``;

const Divider = styled.hr`
  display: block;
  margin: 0.5rem 0;
  height: 2px;
  background-color: ${(props) => props.theme.colors.gray2};
`;
