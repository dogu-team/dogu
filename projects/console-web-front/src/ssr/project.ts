import {
  CloudLicenseResponse,
  OrganizationBase,
  ProjectBase,
  SelfHostedLicenseResponse,
  UserBase,
} from '@dogu-private/console';
import { AxiosError } from 'axios';
import { GetServerSideProps } from 'next';

import { getOrganizationInServerSide } from 'src/api/organization';
import { getProjectInServerSide, getProjectScm } from 'src/api/project';
import { getLicenseInServerSide } from '../../enterprise/api/license';
import { redirectWithLocale } from '../ssr/locale';
import { checkUserVerifiedInServerSide } from '../utils/auth';

export interface ProjectServerSideProps {
  organization: OrganizationBase;
  project: ProjectBase;
  license: CloudLicenseResponse | SelfHostedLicenseResponse;
  user: UserBase;
  isGitIntegrated: boolean;
}

export const getProjectPageServerSideProps: GetServerSideProps<ProjectServerSideProps> = async (context) => {
  try {
    const checkResult = await checkUserVerifiedInServerSide(context);

    if (checkResult.redirect) {
      return checkResult;
    }

    if (checkResult.props.fallback['/registery/check'].isTutorialCompleted === 0) {
      return {
        redirect: redirectWithLocale(context, `/dashboard/${context.query.orgId}/get-started`, false),
      };
    }

    const [license, organization, project, scm] = await Promise.all([
      getLicenseInServerSide(context),
      getOrganizationInServerSide(context),
      getProjectInServerSide(context),
      getProjectScm(context),
    ]);

    return {
      props: {
        organization,
        project,
        license,
        user: checkResult.props.fallback['/registery/check'],
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
