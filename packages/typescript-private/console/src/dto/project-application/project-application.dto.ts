import { PageDtoBase } from '../pagination/page.dto';

export interface FindProjectApplicationDtoBase extends PageDtoBase {
  version?: string;
  extension?: string;
}
