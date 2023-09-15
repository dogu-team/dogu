import { FeatureTableBase, OrganizationBase, UserBase } from '@dogu-private/console';
import { AxiosError } from 'axios';
import { GetServerSideProps } from 'next';

import { getOrganizationInServerSide } from 'src/api/organization';
import { getFeatureConfigInServerSide } from '../../enterprise/api/feature';
import { redirectWithLocale } from '../ssr/locale';
import { checkUserVerifiedInServerSide } from '../utils/auth';

export interface OrganizationServerSideProps {
  organization: OrganizationBase;
  user: UserBase;
  featureConfig: FeatureTableBase;
}

export const getOrganizationPageServerSideProps: GetServerSideProps<OrganizationServerSideProps> = async (context) => {
  try {
    const [organization, checkResult, featureConfig] = await Promise.all([
      getOrganizationInServerSide(context),
      checkUserVerifiedInServerSide(context),
      getFeatureConfigInServerSide(context),
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
        user: checkResult.props.fallback['/registery/check'],
        featureConfig,
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
