import { PageDtoBase } from '../pagination/page.dto';

export interface FindProjectApplicationDtoBase extends PageDtoBase {
  version?: string;
  extension?: string;
}

export interface UploadSampleAppDtoBase {
  category: 'mobile' | 'game';
  extension: 'apk' | 'ipa';
}
