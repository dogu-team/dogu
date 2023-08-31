import { OrganizationBase, ProjectBase } from '@dogu-private/console';
import { AxiosError } from 'axios';
import { GetServerSideProps } from 'next';

import { getOrganizationInServerSide } from 'src/api/organization';
import { getProjectInServerSide, getProjectScm } from 'src/api/project';
import { redirectWithLocale } from '../ssr/locale';
import { checkUserVerifiedInServerSide } from '../utils/auth';

export interface ProjectServerSideProps {
  organization: OrganizationBase;
  project: ProjectBase;
  isGitIntegrated: boolean;
}

export const getProjectPageServerSideProps: GetServerSideProps<ProjectServerSideProps> = async (context) => {
  try {
    const [organization, project, checkResult, scm] = await Promise.all([
      getOrganizationInServerSide(context),
      getProjectInServerSide(context),
      checkUserVerifiedInServerSide(context),
      getProjectScm(context),
    ]);

    if (checkResult.redirect) {
      return checkResult;
    }

    if (checkResult.props.fallback['/registery/check'].isTutorialCompleted === 0) {
      return {
        redirect: redirectWithLocale(context, `/dashboard/${context.query.orgId}/get-started`, false),
      };
    }

    return {
      props: {
        organization,
        project,
        isGitIntegrated: !!scm,
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
