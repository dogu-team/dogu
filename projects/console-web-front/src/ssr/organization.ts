import { CloudLicenseBase, OrganizationResponse, SelfHostedLicenseBase, UserBase } from '@dogu-private/console';
import { AxiosError } from 'axios';
import { GetServerSideProps } from 'next';

import { getOrganizationInServerSide } from 'src/api/organization';
import { getCloudLicenseInServerSide, getSelfHostedLicenseInServerSide } from '../../enterprise/api/license';
import { IS_CLOUD } from '../../pages/_app';
import { redirectWithLocale } from '../ssr/locale';
import { checkUserVerifiedInServerSide } from '../utils/auth';

export interface OrganizationServerSideProps {
  organization: OrganizationResponse;
  license: CloudLicenseBase | SelfHostedLicenseBase;
  user: UserBase;
}

export const getOrganizationPageServerSideProps: GetServerSideProps<OrganizationServerSideProps> = async (context) => {
  try {
    const [organization, license, checkResult] = await Promise.all([
      getOrganizationInServerSide(context),
      IS_CLOUD ? getCloudLicenseInServerSide(context) : getSelfHostedLicenseInServerSide(context),
      checkUserVerifiedInServerSide(context),
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
        license,
        user: checkResult.props.fallback['/registery/check'],
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
