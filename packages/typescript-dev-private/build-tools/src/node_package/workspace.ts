import fs from 'fs';
import path from 'path';

export function findRootWorkspace(): string {
  // find .dogu_workspace in parent
  let current = process.cwd();
  for (let i = 0; i < 10; i++) {
    const doguWorkspace = path.resolve(current, '.dogu-workspace');
    if (fs.existsSync(doguWorkspace)) {
      return current;
    }
    const parent = path.resolve(current, '..');
    if (parent === current) {
      break;
    }
    current = parent;
  }

  throw new Error('Cannot find .dogu-workspace');
}
