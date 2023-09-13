import { Printable } from '@dogu-tech/common';
import { DeviceHostClient } from '@dogu-tech/device-client';
import { spawnSync, SpawnSyncOptionsWithStringEncoding, SpawnSyncReturns } from 'child_process';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { ConsoleActionClient } from '../console-action-client';

export async function checkoutProject(
  printable: Printable,
  consoleActionClient: ConsoleActionClient,
  deviceHostClient: DeviceHostClient,
  workspacePath: string,
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

  function command(command: string, args: string[], logMessage: string, errorMessage: string, spawnOptions?: SpawnSyncOptionsWithStringEncoding): SpawnSyncReturns<string> {
    printable.info(logMessage);
    printable.info('Running command', { command: `${command} ${args.join(' ')}` });
    const env = {
      ...process.env,
      GIT_TERMINAL_PROMPT: 'false',
      GIT_ASK_YESNO: 'false',
    };
    const mergedOptions = _.merge(
      {
        stdio: 'inherit',
        env,
        encoding: 'utf8',
      },
      spawnOptions,
    );
    const result = spawnSync(command, args, mergedOptions);
    printable.verbose?.('Command result', { result });
    if (result.status !== 0) {
      throw new Error(errorMessage);
    }
    return result;
  }

  command(git, [...configArgs, '--version'], 'Check Git...', 'Git not found');
  const dotGitPath = path.resolve(workspacePath, '.git');
  const stat = await fs.promises.stat(dotGitPath).catch(() => null);

  const clone = (checkoutUrl: string) =>
    command(git, [...configArgs, 'clone', '--depth', '1', '--branch', branchOrTag, checkoutUrl, workspacePath], 'Cloning Git repository...', 'Git clone failed');

  if (!stat) {
    printable.info('Git repository not found', { workspacePath });
    clone(checkoutUrl);
  } else {
    printable.info('Git repository found', { workspacePath });
    const result = command(git, [...configArgs, '-C', workspacePath, 'remote', 'get-url', 'origin'], 'Getting Git remote url...', 'Git remote get-url failed', {
      stdio: 'pipe',
      encoding: 'utf8',
    });
    const remoteUrl = result.stdout.trim();
    const parsedRemoteUrl = new URL(remoteUrl);
    const parsedCheckoutUrl = new URL(checkoutUrl);
    if (parsedRemoteUrl.origin !== parsedCheckoutUrl.origin || parsedRemoteUrl.pathname !== parsedCheckoutUrl.pathname) {
      printable.info('Git remote url is different, re clone', { remoteUrl, checkoutUrl });
      await fs.promises.rm(workspacePath, { recursive: true, force: true });
      clone(checkoutUrl);
      return;
    }

    if (clean) {
      command(git, [...configArgs, '-C', workspacePath, 'reset', '--hard'], 'Resetting Git repository...', 'Git reset failed');
      command(git, [...configArgs, '-C', workspacePath, 'clean', '-fdx'], 'Cleaning Git repository...', 'Git clean failed');
    }
    command(git, [...configArgs, '-C', workspacePath, 'fetch', 'origin', branchOrTag], 'Fetching Git repository...', 'Git fetch failed');
    command(git, [...configArgs, '-C', workspacePath, 'checkout', branchOrTag], 'Checking out Git repository...', 'Git checkout failed');
    command(git, [...configArgs, '-C', workspacePath, 'pull'], 'Pulling Git repository...', 'Git pull failed');
  }
}
