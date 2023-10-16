import { Platform } from '@dogu-private/types';
import { PageDtoBase } from '../pagination/page.dto';

export interface FindCloudDevicesDtoBase extends PageDtoBase {
  keyword: string;
  platform?: Platform;
  version: string;
}
