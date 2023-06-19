import { OrganizationId } from '@dogu-private/types';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { updateLastAccessOrganization } from '../api/user';

const useRecentOrgFromSession = () => {
  const router = useRouter();
  const orgId = router.query.orgId;

  useEffect(() => {
    (async () => {
      if (orgId) {
        const sessionOrgId = sessionStorage.getItem('last_org');
        if (orgId !== sessionOrgId) {
          try {
            await updateLastAccessOrganization(orgId as OrganizationId);
            sessionStorage.setItem('last_org', `${orgId}`);
          } catch (e) {}
        }
      }
    })();
  }, [orgId]);
};

export default useRecentOrgFromSession;
