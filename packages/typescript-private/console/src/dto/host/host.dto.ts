import { HostBase } from '../../base/host';
import { PageDtoBase } from '../pagination/page.dto';

export interface CreateHostDtoBase extends Pick<HostBase, 'name'> {
  name: string;
  // expiredTime?: DurationLike;
}

export interface FindHostsByOrganizationIdDtoBase extends PageDtoBase {
  keyword?: string;
  token?: string;
}

export type UpdateHostNameDtoBase = Pick<HostBase, 'name'>;
