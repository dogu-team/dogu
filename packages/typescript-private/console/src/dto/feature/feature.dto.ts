import { EDITION_TYPE } from '@dogu-private/types';

export interface FeatureTableBase {
  defaultEdition: EDITION_TYPE;
  fileService: 's3' | 'nexus';
  useSampleProject: boolean;
  emailVerification: boolean;
  cookieSecure: boolean;
  forceInvitation: boolean;
  thirdPartyLogin: boolean;
}
