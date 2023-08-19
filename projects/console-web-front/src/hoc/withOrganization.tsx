import { FeatureTableBase, OrganizationBase, UserBase } from '@dogu-private/console';
import { AxiosError } from 'axios';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import useSWR, { KeyedMutator, SWRConfig } from 'swr';

import { NextPageWithLayout } from 'pages/_app';
import { swrAuthFetcher } from 'src/api';
import { getOrganizationInServerSide } from 'src/api/organization';
import ErrorBox from 'src/components/common/boxes/ErrorBox';
import useRecentOrgFromSession from '../hooks/useRecentOrgFromSession';
import { checkUserVerifiedInServerSide } from '../utils/auth';
import { redirectWithLocale } from '../ssr/locale';
import { getFeatureConfigInServerSide } from '../enterprise/api/feature';
import { FeatureContext } from '../enterprise/contexts/feature';

export interface OrganizationServerSideProps {
  fallback: {
    [key: string]: OrganizationBase | UserBase;
  };
  featureConfig: FeatureTableBase;
}

export interface WithOrganizationProps {
  organization: OrganizationBase;
  mutateOrganization: KeyedMutator<OrganizationBase>;
  user: UserBase;
}

export default function withOrganization(WrappedComponents: NextPageWithLayout<WithOrganizationProps>) {
  const Component: NextPageWithLayout<OrganizationServerSideProps> = ({ fallback, featureConfig }) => {
    const router = useRouter();
    const organizationId = router.query.orgId;
    const { data, error, mutate, isLoading } = useSWR<OrganizationBase>(`/organizations/${organizationId}`, swrAuthFetcher, { revalidateOnFocus: false });
    const { data: user, error: userError, isLoading: userLoading } = useSWR<UserBase>('/registery/check', swrAuthFetcher, { revalidateOnFocus: false });
    useRecentOrgFromSession();

    if (isLoading || userLoading) {
      return null;
    }

    if (!data || error || !user || userError) {
      return <ErrorBox title="Oops..." desc="Failed to load console" />;
    }

    return (
      <SWRConfig value={{ fallback }}>
        <FeatureContext.Provider value={featureConfig}>
          <WrappedComponents organization={data} mutateOrganization={mutate} user={user} />
        </FeatureContext.Provider>
      </SWRConfig>
    );
  };

  Component.getLayout = WrappedComponents.getLayout;

  return Component;
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
        fallback: {
          [`/organizations/${context.query.orgId}`]: organization,
          ...checkResult.props.fallback,
        },
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
