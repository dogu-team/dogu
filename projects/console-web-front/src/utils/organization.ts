import { OrganizationBase } from '@dogu-private/console';

export const isOrganizationScmIntegrated = (organization: OrganizationBase): boolean => {
  return !!organization?.organizationScms && organization.organizationScms.length > 0;
};
