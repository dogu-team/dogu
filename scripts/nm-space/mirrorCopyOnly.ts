import path from 'path';
import { mirrorWorkspace } from '../node_package/mirrorWorkspace';
import { Config } from './config';

void (async (): Promise<void> => {
  const workspace = await mirrorWorkspace(path.resolve('nm-space'), { copyOnly: true, excludeDirs: Config.excludeDirs });
})();
