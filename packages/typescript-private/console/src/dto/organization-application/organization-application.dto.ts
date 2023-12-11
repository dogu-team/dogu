import { PageDtoBase } from '../..';

export interface FindOrganizationApplicationDtoBase extends PageDtoBase {
  version?: string;
  extension?: string;
  latestOnly?: boolean;
}

export interface FindOrganizationApplicationByPackageNameDtoBase extends PageDtoBase {
  extension?: string;
}
