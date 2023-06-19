import path from 'path';
import { mirrorWorkspace } from '../node_package/mirrorWorkspace';

void (async (): Promise<void> => {
  const workspace = await mirrorWorkspace(path.resolve('nm-space'));
})();
