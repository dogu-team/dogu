import styled from 'styled-components';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';

import { NextPageWithLayout } from 'pages/_app';
import withProject, { getProjectPageServerSideProps, WithProjectProps } from 'src/hoc/withProject';
import ProjectLayout from 'src/components/layouts/ProjectLayout';
import RoutineUpdator from 'src/components/routine/editor/RoutineUpdator';
import { swrAuthFetcher } from 'src/api';

const ProjectRoutineEditorPage: NextPageWithLayout<WithProjectProps> = ({ organization, project }) => {
  const router = useRouter();
  const routineId = router.query.routineId as string | undefined;
  const { data } = useSWR<string>(routineId && `/organizations/${organization.organizationId}/projects/${project.projectId}/routines/file/${routineId}`, swrAuthFetcher, {
    revalidateOnFocus: false,
  });

  if (!routineId || !data) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Edit routine - {project.name} | Dogu</title>
      </Head>
      <Box>
        <RoutineUpdator organizationId={organization.organizationId} projectId={project.projectId} routineId={routineId} value={data} />
      </Box>
    </>
  );
};

ProjectRoutineEditorPage.getLayout = (page) => {
  return <ProjectLayout>{page}</ProjectLayout>;
};

export const getServerSideProps = getProjectPageServerSideProps;

export default withProject(ProjectRoutineEditorPage);

const Box = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
`;
