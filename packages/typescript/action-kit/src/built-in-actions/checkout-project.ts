import { Printable } from '@dogu-tech/common';
import { DeviceHostClient } from '@dogu-tech/device-client';
import { HostPaths } from '@dogu-tech/node';
import { ProjectId } from '@dogu-tech/types';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ConsoleActionClient } from '../console-action-client';

export async function checkoutProject(
  printable: Printable,
  consoleActionClient: ConsoleActionClient,
  deviceHostClient: DeviceHostClient,
  DOGU_DEVICE_WORKSPACE_PATH: string,
  DOGU_PROJECT_ID: ProjectId,
  branchOrTag: string,
  clean: boolean,
) {
  const { url } = await consoleActionClient.getGitlabUrl();
  printable.info('Gitlab URL', { url });
  const pathMap = await deviceHostClient.getPathMap();
  const { git } = pathMap.common;
  printable.info('Git path', { git });
  const configArgs = ['-c', 'core.longpaths=true'];

  function command(command: string, args: string[], logMessage: string, errorMessage: string): void {
    printable.info(logMessage);
    printable.info('Running command', { command: `${command} ${args.join(' ')}` });
    const result = spawnSync(command, args, {
      stdio: 'inherit',
    });
    printable.verbose?.('Command result', { result });
    if (result.status !== 0) {
      throw new Error(errorMessage);
    }
  }

  command(git, [...configArgs, '--version'], 'Check Git...', 'Git not found');
  const deviceProjectWorkspacePath = HostPaths.deviceProjectWorkspacePath(DOGU_DEVICE_WORKSPACE_PATH, DOGU_PROJECT_ID);
  await fs.promises.mkdir(deviceProjectWorkspacePath, { recursive: true });
  const deviceProjectGitPath = HostPaths.deviceProjectGitPath(deviceProjectWorkspacePath);
  const dotGitPath = path.resolve(deviceProjectGitPath, '.git');
  const stat = await fs.promises.stat(dotGitPath).catch(() => null);
  if (!stat) {
    printable.info('Git repository not found', { deviceProjectGitPath });
    command(git, [...configArgs, 'clone', '--depth', '1', '--branch', branchOrTag, url, deviceProjectGitPath], 'Cloning Git repository...', 'Git clone failed');
  } else {
    printable.info('Git repository found', { deviceProjectGitPath });
    if (clean) {
      command(git, [...configArgs, '-C', deviceProjectGitPath, 'reset', '--hard'], 'Resetting Git repository...', 'Git reset failed');
      command(git, [...configArgs, '-C', deviceProjectGitPath, 'clean', '-fdx'], 'Cleaning Git repository...', 'Git clean failed');
    }
    command(git, [...configArgs, '-C', deviceProjectGitPath, 'fetch', 'origin', branchOrTag], 'Fetching Git repository...', 'Git fetch failed');
    command(git, [...configArgs, '-C', deviceProjectGitPath, 'checkout', branchOrTag], 'Checking out Git repository...', 'Git checkout failed');
    command(git, [...configArgs, '-C', deviceProjectGitPath, 'pull'], 'Pulling Git repository...', 'Git pull failed');
  }
}
