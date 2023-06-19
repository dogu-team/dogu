import { OrganizationBase, ProjectBase, RepositoryFileMetaTree, RepositoryFileTree, UserBase } from '@dogu-private/console';
import { AxiosError } from 'axios';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import useSWR, { KeyedMutator, SWRConfig } from 'swr';

import { NextPageWithLayout } from 'pages/_app';
import { swrAuthFetcher } from 'src/api';
import { getOrganizationInServerSide } from 'src/api/organization';
import { getProjectInServerSide } from 'src/api/project';
import ErrorBox from 'src/components/common/boxes/ErrorBox';
import { isWebViewAgent } from 'src/utils/server';
import useRecentOrgFromSession from '../hooks/useRecentOrgFromSession';
import { checkUserVerifiedInServerSide } from '../utils/auth';
import { redirectWithLocale } from '../ssr/locale';
import { getUserByIdInServerSide } from '../api/user';

export interface ProjectRepositoryServerSideProps {
  fallback: {
    [key: string]: OrganizationBase | ProjectBase | UserBase;
  };
  user: UserBase;
  isWebview: boolean;
}

export interface WithProjectRepositoryProps {
  organization: OrganizationBase;
  project: ProjectBase;
  user: UserBase;
  mutateOrganization: KeyedMutator<OrganizationBase>;
  mutateProject: KeyedMutator<ProjectBase>;
  isWebview: boolean;
}

export default function withProjectRepository(WrappedComponent: NextPageWithLayout<WithProjectRepositoryProps>) {
  const Component: NextPageWithLayout<ProjectRepositoryServerSideProps> = ({ fallback, isWebview, user }) => {
    const router = useRouter();
    const organizationId = router.query.orgId;
    const projectId = router.query.pid;
    const {
      data: organization,
      error: organizationError,
      mutate: mutateOrganization,
      isLoading: isOrganizationLoading,
    } = useSWR<OrganizationBase>(`/organizations/${organizationId}`, swrAuthFetcher, { revalidateOnFocus: false });
    const {
      data: project,
      error: projectError,
      isLoading: isProjectLoading,
      mutate: mutateProject,
    } = useSWR<ProjectBase>(`/organizations/${organizationId}/projects/${projectId}`, swrAuthFetcher, { revalidateOnFocus: false });

    useRecentOrgFromSession();

    const isOrganizationError = !organization || organizationError;
    const isProjectError = !project || projectError;

    if (isOrganizationLoading || isProjectLoading) {
      return null;
    }

    if (isOrganizationError || isProjectError) {
      return <ErrorBox title="Oops..." desc="Failed to load console" />;
    }

    return (
      <SWRConfig value={{ fallback }}>
        <WrappedComponent organization={organization} project={project} user={user} mutateOrganization={mutateOrganization} mutateProject={mutateProject} isWebview={isWebview} />
      </SWRConfig>
    );
  };

  Component.getLayout = WrappedComponent.getLayout;

  return Component;
}

export const getProjectRepositoryPageServerSideProps: GetServerSideProps<ProjectRepositoryServerSideProps> = async (context) => {
  try {
    const [organization, project, checkResult, user] = await Promise.all([
      getOrganizationInServerSide(context),
      getProjectInServerSide(context),
      checkUserVerifiedInServerSide(context),
      getUserByIdInServerSide(context),
    ]);

    const isWebview = isWebViewAgent(context);

    if (checkResult.redirect) {
      return checkResult;
    }

    return {
      props: {
        fallback: {
          [`/organizations/${context.query.orgId}`]: organization,
          [`/organizations/${context.query.orgId}/projects/${context.query.pid}`]: project,
          ...checkResult.props.fallback,
        },
        user,
        isWebview,
      },
    };
  } catch (e) {
    if (e instanceof AxiosError) {
      if (e.response?.status === 404 || e.response?.status === 401) {
        return {
          notFound: true,
        };
      }
    }

    return {
      redirect: redirectWithLocale(context, '/signin', false),
    };
  }
};
