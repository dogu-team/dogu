import { CloudLicenseResponse, OrganizationBase, UserBase } from '@dogu-private/console';
import { AxiosError } from 'axios';
import { GetServerSideProps } from 'next';

import { getOrganizationInServerSide } from 'src/api/organization';
import { getLicenseInServerSide } from '../../enterprise/api/license';
import { redirectWithLocale } from '../ssr/locale';
import { checkUserVerifiedInServerSide } from '../utils/auth';

export interface OrganizationServerSideProps {
  organization: OrganizationBase;
  license: CloudLicenseResponse;
  user: UserBase;
}

export const getOrganizationPageServerSideProps: GetServerSideProps<OrganizationServerSideProps> = async (context) => {
  try {
    const checkResult = await checkUserVerifiedInServerSide(context);

    if (checkResult.redirect) {
      return checkResult;
    }

    if (checkResult.props.user.isTutorialCompleted === 0) {
      return {
        redirect: redirectWithLocale(context, `/dashboard/${context.query.orgId}/get-started`, false),
      };
    }

    const [organization, license] = await Promise.all([
      getOrganizationInServerSide(context),
      getLicenseInServerSide(context),
    ]);

    return {
      props: {
        organization,
        license,
        user: checkResult.props.user,
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
