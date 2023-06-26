import { loadFeatureConfigSync } from '@dogu-tech/node';
import { env } from './env';
import { logger } from './module/logger/logger.instance';

export interface FeatureTable {
  fileService: 's3' | 'nexus';
  useSampleProject: boolean;
  gitlabInitCheck: boolean;
  emailVerification: boolean;
  useGitlabIdByUserId: boolean;
  rdbSslConnection: boolean;
  cookieSecure: boolean;
  forceInvitation: boolean;
  thirdPartyLogin: boolean;
}

export const FeatureConfig = loadFeatureConfigSync<FeatureTable>(env.DOGU_RUN_TYPE, logger);
