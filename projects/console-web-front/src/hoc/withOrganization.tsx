import { OrganizationBase, UserBase } from '@dogu-private/console';
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

export interface OrganizationServerSideProps {
  fallback: {
    [key: string]: OrganizationBase | UserBase;
  };
}

export interface WithOrganizationProps {
  organization: OrganizationBase;
  mutateOrganization: KeyedMutator<OrganizationBase>;
}

export default function withOrganization(WrappedComponents: NextPageWithLayout<WithOrganizationProps>) {
  const Component: NextPageWithLayout<OrganizationServerSideProps> = ({ fallback }) => {
    const router = useRouter();
    const organizationId = router.query.orgId;
    const { data, error, mutate, isLoading } = useSWR<OrganizationBase>(`/organizations/${organizationId}`, swrAuthFetcher, { revalidateOnFocus: false });
    useRecentOrgFromSession();

    if (isLoading) {
      return null;
    }

    if (!data || error) {
      return <ErrorBox title="Oops..." desc="Failed to load console" />;
    }

    return (
      <SWRConfig value={{ fallback }}>
        <WrappedComponents organization={data} mutateOrganization={mutate} />
      </SWRConfig>
    );
  };

  Component.getLayout = WrappedComponents.getLayout;

  return Component;
}

export const getOrganizationPageServerSideProps: GetServerSideProps<OrganizationServerSideProps> = async (context) => {
  try {
    const [organization, checkResult] = await Promise.all([getOrganizationInServerSide(context), checkUserVerifiedInServerSide(context)]);

    if (checkResult.redirect) {
      return checkResult;
    }

    return {
      props: {
        fallback: {
          [`/organizations/${context.query.orgId}`]: organization,
          ...checkResult.props.fallback,
        },
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
