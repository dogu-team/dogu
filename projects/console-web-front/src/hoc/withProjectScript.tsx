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
import { getScriptFileMetaTreeInServerSide } from '../api/repository';
import { ExplorerTree } from '../components/explorer/type';
import { redirectWithLocale } from '../ssr/locale';

export interface ProjectScriptServerSideProps {
  fallback: {
    [key: string]: OrganizationBase | ProjectBase | UserBase;
  };
  repositoryFileTree: RepositoryFileMetaTree;
  explorerTree: ExplorerTree;
}

export interface WithProjectScriptProps {
  organization: OrganizationBase;
  project: ProjectBase;
  mutateOrganization: KeyedMutator<OrganizationBase>;
  mutateProject: KeyedMutator<ProjectBase>;
  repositoryFileMetaTree: RepositoryFileMetaTree;
  explorerTree: ExplorerTree;
}

export default function withProjectScript(WrappedComponent: NextPageWithLayout<WithProjectScriptProps>) {
  const Component: NextPageWithLayout<ProjectScriptServerSideProps> = ({ fallback, repositoryFileTree: repositoryTree, explorerTree }) => {
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
        <WrappedComponent
          organization={organization}
          project={project}
          repositoryFileMetaTree={repositoryTree}
          explorerTree={explorerTree}
          mutateOrganization={mutateOrganization}
          mutateProject={mutateProject}
        />
      </SWRConfig>
    );
  };

  Component.getLayout = WrappedComponent.getLayout;

  return Component;
}

const converFolderToExplorer = (repositoryFileMetaTree: RepositoryFileMetaTree): ExplorerTree => {
  const explorerTree: ExplorerTree = {};

  for (const fileMeta of repositoryFileMetaTree) {
    if (!fileMeta.path) {
      continue;
    }

    if (fileMeta.type === 'tree') {
      const depth = fileMeta.path.split('/').length;
      const parentPath = fileMeta.path
        .split('/')
        .slice(0, depth - 1)
        .join('/');

      if (explorerTree[parentPath]) {
        explorerTree[parentPath].children.push({ type: 'dir', name: fileMeta.path, path: fileMeta.path });
      }

      explorerTree[fileMeta.path] = {
        depth: depth,
        children: [],
      };
    } else {
      const depth = fileMeta.path.split('/').length;
      const parentPath = fileMeta.path
        .split('/')
        .slice(0, depth - 1)
        .join('/');

      if (explorerTree[parentPath] === undefined) {
        explorerTree[parentPath] = {
          depth: depth - 1,
          children: [],
        };
      }

      explorerTree[parentPath].children.push({
        type: 'file',
        name: fileMeta.path.split('/').slice(depth - 1)[0],
        path: fileMeta.path,
      });
    }
  }

  return explorerTree;
};

export const getProjectScriptPageServerSideProps: GetServerSideProps<ProjectScriptServerSideProps> = async (context) => {
  try {
    const [organization, project, checkResult, repositoryFileMetaTree] = await Promise.all([
      getOrganizationInServerSide(context),
      getProjectInServerSide(context),
      checkUserVerifiedInServerSide(context),
      getScriptFileMetaTreeInServerSide(context),
    ]);

    const isWebview = isWebViewAgent(context);
    const explorerTree = converFolderToExplorer(repositoryFileMetaTree);

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
        repositoryFileTree: repositoryFileMetaTree,
        explorerTree: explorerTree,
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
