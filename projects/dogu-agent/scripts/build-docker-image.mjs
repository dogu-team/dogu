import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function runDockerCommand(args, message) {
  console.log(message);
  const result = spawnSync('docker', args, { stdio: 'inherit', encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`docker ${args.join(' ')} failed with status ${result.status}`);
  }
  if (result.error) {
    throw result.error;
  }
}

runDockerCommand(['--version'], 'Checking docker version');

const doguWorkspaceFileName = '.dogu-workspace';
const doguWorkspacePath = path.resolve(__dirname, '../../..');
if (!fs.existsSync(path.resolve(doguWorkspacePath, doguWorkspaceFileName))) {
  throw new Error(`${doguWorkspaceFileName} file not found in ${doguWorkspacePath}`);
} else {
  console.log(`${doguWorkspaceFileName} found in ${doguWorkspacePath}`);
}

runDockerCommand(['build', '--target', 'dogu-agent', '--platform', 'linux/amd64', '-t', 'dogu-agent', doguWorkspacePath], 'Building dogu-agent image');
