import { Printable } from '@dogu-tech/common';
import { DeviceHostClient } from '@dogu-tech/device-client';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ConsoleActionClient } from '../console-action-client';

export async function checkoutProject(
  printable: Printable,
  consoleActionClient: ConsoleActionClient,
  deviceHostClient: DeviceHostClient,
  DOGU_ROUTINE_WORKSPACE_PATH: string,
  branchOrTag: string,
  clean: boolean,
  checkoutUrl?: string,
) {
  if (!checkoutUrl) {
    printable.info('Getting Git url from console...');
    try {
      const { url } = await consoleActionClient.getGitlabUrl();
      checkoutUrl = url;
    } catch (error) {
      for (let i = 0; i < 3; ++i) {
        printable.error('🐱 Git is integrated with 🐶 Dogu project?');
      }

      throw error;
    }
  }
  printable.info('Git url', { checkoutUrl });

  const pathMap = await deviceHostClient.getPathMap();
  const { git } = pathMap.common;
  printable.info('Git path', { git });
  const configArgs = ['-c', 'core.longpaths=true'];

  function command(command: string, args: string[], logMessage: string, errorMessage: string): void {
    printable.info(logMessage);
    printable.info('Running command', { command: `${command} ${args.join(' ')}` });
    const env = {
      ...process.env,
      GIT_TERMINAL_PROMPT: 'false',
      GIT_ASK_YESNO: 'false',
    };
    const result = spawnSync(command, args, {
      stdio: 'inherit',
      env,
    });
    printable.verbose?.('Command result', { result });
    if (result.status !== 0) {
      throw new Error(errorMessage);
    }
  }

  command(git, [...configArgs, '--version'], 'Check Git...', 'Git not found');
  const routineWorkspacePath = DOGU_ROUTINE_WORKSPACE_PATH;
  const dotGitPath = path.resolve(routineWorkspacePath, '.git');
  const stat = await fs.promises.stat(dotGitPath).catch(() => null);
  if (!stat) {
    printable.info('Git repository not found', { routineWorkspacePath });
    command(git, [...configArgs, 'clone', '--depth', '1', '--branch', branchOrTag, checkoutUrl, routineWorkspacePath], 'Cloning Git repository...', 'Git clone failed');
  } else {
    printable.info('Git repository found', { routineWorkspacePath });
    if (clean) {
      command(git, [...configArgs, '-C', routineWorkspacePath, 'reset', '--hard'], 'Resetting Git repository...', 'Git reset failed');
      command(git, [...configArgs, '-C', routineWorkspacePath, 'clean', '-fdx'], 'Cleaning Git repository...', 'Git clean failed');
    }
    command(git, [...configArgs, '-C', routineWorkspacePath, 'fetch', 'origin', branchOrTag], 'Fetching Git repository...', 'Git fetch failed');
    command(git, [...configArgs, '-C', routineWorkspacePath, 'checkout', branchOrTag], 'Checking out Git repository...', 'Git checkout failed');
    command(git, [...configArgs, '-C', routineWorkspacePath, 'pull'], 'Pulling Git repository...', 'Git pull failed');
  }
}
