import { Vendor } from '@dogu-private/device-data';
import { OrganizationId } from '@dogu-private/types';

export interface GetWebResponsiveSnapshotsDtoBase {
  organizationId: OrganizationId;
  testExecutorId: string;
}

export interface getWebResponsiveListDtoBase {
  organizationId: OrganizationId;
}

export interface CreateWebResponsiveDtoBase {
  organizationId: OrganizationId;
  vendors: Vendor[];
  urls: string[];
}
