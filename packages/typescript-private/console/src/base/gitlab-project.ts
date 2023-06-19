import { propertiesOf } from '@dogu-tech/common';

export interface DoguConfig {
  scriptFolderPaths: string[];
}

export const DoguConfigKeys = propertiesOf<DoguConfig>();
