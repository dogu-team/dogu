import { LicenseBase, UserBase } from '@dogu-private/console';
import { GetServerSideProps } from 'next';

import { getUserInServerSide } from '../../src/api/registery';
import { getLicenseInServerSide } from '../api/license';

export interface AdminProps {
  license: LicenseBase;
  user: UserBase;
}

export const getAdminServerSideProps: GetServerSideProps<AdminProps> = async (context) => {
  try {
    const [user, license] = await Promise.all([getUserInServerSide(context), getLicenseInServerSide(context, null)]);
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
