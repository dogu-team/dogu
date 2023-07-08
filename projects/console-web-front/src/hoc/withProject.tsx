import { OrganizationBase, ProjectBase, UserBase } from '@dogu-private/console';
import { AxiosError, isAxiosError } from 'axios';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import useSWR, { KeyedMutator, SWRConfig } from 'swr';

import { NextPageWithLayout } from 'pages/_app';
import { swrAuthFetcher } from 'src/api';
import { getOrganizationInServerSide } from 'src/api/organization';
import { getProjectInServerSide, getProjectScm } from 'src/api/project';
import ErrorBox from 'src/components/common/boxes/ErrorBox';
import useRecentOrgFromSession from '../hooks/useRecentOrgFromSession';
import { checkUserVerifiedInServerSide } from '../utils/auth';
import { redirectWithLocale } from '../ssr/locale';

export interface ProjectServerSideProps {
  fallback: {
    [key: string]: OrganizationBase | ProjectBase | UserBase;
  };
  isGitIntegrated: boolean;
}

export interface WithProjectProps {
  organization: OrganizationBase;
  project: ProjectBase;
  mutateOrganization: KeyedMutator<OrganizationBase>;
  mutateProject: KeyedMutator<ProjectBase>;
  isGitIntegrated: boolean;
}

export default function withProject<P extends WithProjectProps>(WrappedComponent: NextPageWithLayout<P>) {
  const Component: NextPageWithLayout<ProjectServerSideProps> = ({ fallback, ...props }) => {
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
        <WrappedComponent {...(props as P)} organization={organization} project={project} mutateOrganization={mutateOrganization} mutateProject={mutateProject} />
      </SWRConfig>
    );
  };

  Component.getLayout = WrappedComponent.getLayout;

  return Component;
}

export const getProjectPageServerSideProps: GetServerSideProps<ProjectServerSideProps> = async (context) => {
  try {
    const [organization, project, checkResult] = await Promise.all([getOrganizationInServerSide(context), getProjectInServerSide(context), checkUserVerifiedInServerSide(context)]);

    let isGitIntegrated = false;
    try {
      await getProjectScm(context);
      isGitIntegrated = true;
    } catch (e) {}

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
        isGitIntegrated,
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
