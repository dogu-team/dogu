import { SelfHostedLicenseBase, UserBase } from '@dogu-private/console';
import { GetServerSideProps } from 'next';

import { getUserInServerSide } from '../../src/api/registery';
import { getSelfHostedLicenseInServerSide } from '../api/license';

export interface AdminProps {
  license: SelfHostedLicenseBase;
  user: UserBase;
}

export const getSelfHostedAdminServerSideProps: GetServerSideProps<AdminProps> = async (context) => {
  try {
    const [user, license] = await Promise.all([
      getUserInServerSide(context),
      getSelfHostedLicenseInServerSide(context),
    ]);
    return {
      props: {
        user,
        license,
      },
    };
  } catch (e) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
};
