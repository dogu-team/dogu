import { PageDtoBase } from '../pagination/page.dto';

export interface CreateDeviceTagDtoBase {
  name: string;
}

export interface FindDeviceTagsByOrganizationIdDtoBase extends PageDtoBase {
  keyword?: string;
}

export interface UpdateDeviceTagDtoBase {
  name: string;
}
