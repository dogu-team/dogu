import { ProjectBase } from '@dogu-private/console';
import { isAxiosError } from 'axios';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import { ProjectContext } from '../../hooks/context/useProjectContext';
import { getErrorMessageFromAxios } from '../../utils/error';
import ErrorBox from '../common/boxes/ErrorBox';

import ConsoleLayout, { ConsoleLayoutProps } from './ConsoleLayout';
import ProjectSideBar from './ProjectSideBar';

interface Props extends Omit<ConsoleLayoutProps, 'sidebar'> {
  innerSidebar?: React.ReactNode;
  project: ProjectBase;
}

const ProjectLayoutWithSidebar = ({ children, innerSidebar, project, ...props }: Props) => {
  const { data, error, isLoading, mutate } = useSWR<ProjectBase>(
    `/organizations/${project.organizationId}/projects/${project.projectId}`,
    swrAuthFetcher,
    {
      revalidateOnFocus: false,
      fallbackData: project,
    },
  );

  if (isLoading) {
    return null;
  }

  if (error) {
    return (
      <ErrorBox
        title="Something went wrong"
        desc={isAxiosError(error) ? getErrorMessageFromAxios(error) : 'Cannot get project information'}
      />
    );
  }

  return (
    <ProjectContext.Provider value={{ project: data ?? project, mutate }}>
      <ConsoleLayout sidebar={<ProjectSideBar />} {...props} padding="2rem 2rem 0">
        <FlexRow>
          {!!innerSidebar && <SideBar offset={56}>{innerSidebar}</SideBar>}
          <Content hasSidebar={!!innerSidebar}>{children}</Content>
        </FlexRow>
      </ConsoleLayout>
    </ProjectContext.Provider>
  );
};

const FlexRow = styled.div`
  display: flex;
  width: 100%;
  flex: 1;
  height: 100%;
`;

const SideBar = styled.div<{ offset: number }>`
  position: sticky;
  top: 0px;
  width: 300px;
  max-height: calc(100dvh - 57px);
  padding: 1rem 1rem 0 0;
  flex-shrink: 0;
  overflow-y: auto;
  border-right: 1px solid ${(props) => props.theme.colors.gray2};
  padding-bottom: 1rem;
  z-index: 1;
`;

const Content = styled.div<{ hasSidebar: boolean }>`
  flex: 1;
  padding: 0 0 6rem ${(props) => (props.hasSidebar ? '1rem' : '0')};
`;

export default ProjectLayoutWithSidebar;
