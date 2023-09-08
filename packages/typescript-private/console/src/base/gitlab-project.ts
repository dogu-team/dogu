import { propertiesOf } from '@dogu-tech/common';

export interface DoguConfig {
  scriptFolderPaths?: string[];
  workingDirPaths?: string[];
}

export const DoguConfigKeys = propertiesOf<DoguConfig>();
