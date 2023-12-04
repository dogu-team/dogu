import { Printable } from '@dogu-tech/common';
import { DeviceHostClient } from '@dogu-tech/device-client';
import { exec, spawnSync } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';
import { GitCommand, GitCommandBuilder, isGitRepositoryPath, isSameRemoteOriginUrl } from '..';
import { ConsoleActionClient } from '../console-action-client';

const execAsync = promisify(exec);

export async function checkoutProject(
  printable: Printable,
  consoleActionClient: ConsoleActionClient,
  deviceHostClient: DeviceHostClient,
  workspacePath: string,
  clean: boolean,
  branch?: string,
  tag?: string,
  checkoutUrl?: string,
): Promise<void> {
  if (!branch && !tag) {
    throw new Error('branch or tag must be specified');
  }

  if (!checkoutUrl) {
    printable.info('Getting Git url from console...');
    try {
      const { url } = await consoleActionClient.getGitUrl();
      checkoutUrl = url;
    } catch (error) {
      for (let i = 0; i < 3; ++i) {
        printable.error('🐱 Git is integrated with 🐶 Dogu project?');
      }

      throw error;
    }
  }
  printable.info('Git url', { checkoutUrl });

  let git = await execAsync('git --version', { encoding: 'utf8' })
    .then(({ stdout, stderr }) => {
      if (stderr) {
        return '';
      }
      if (stdout) {
        printable.info('Git executable found', { stdout });
      }
      return 'git';
    })
    .catch(() => '');
  if (!git) {
    printable.info('Git executable not found. Getting from device host...');
    const pathMap = await deviceHostClient.getPathMap();
    git = pathMap.common.git;
  }
  printable.info('Git executable path', { git });

  function runGitCommand(gitCommand: GitCommand, logMessage: string, errorMessage: string): void {
    const { executablePath, args, env } = gitCommand;
    printable.info(logMessage);
    printable.info('Running command', { command: `${executablePath} ${args.join(' ')}` });
    const result = spawnSync(executablePath, args, {
      env: {
        ...process.env,
        ...env,
      },
      stdio: 'inherit',
      encoding: 'utf8',
    });
    printable.verbose?.('Command result', { result });
    if (result.status !== 0) {
      throw new Error(errorMessage);
    }
  }

  const gitCommandBuilder = new GitCommandBuilder(git, workspacePath);
  const gitVersionCommand = await gitCommandBuilder.version();
  runGitCommand(gitVersionCommand, 'Checking Git executable...', 'Git executable not found');

  if (!(await isGitRepositoryPath(workspacePath))) {
    printable.info('Git repository not found. deleting workspace...', { workspacePath });
    await fs.promises.rm(workspacePath, { recursive: true, force: true });

    const gitCloneCommand = await gitCommandBuilder.clone({ url: checkoutUrl });
    runGitCommand(gitCloneCommand, 'Cloning Git repository...', 'Git clone failed');
  }

  if (!(await isSameRemoteOriginUrl(git, workspacePath, checkoutUrl))) {
    printable.info('Git remote url is not same. deleting workspace...', { workspacePath });
    await fs.promises.rm(workspacePath, { recursive: true, force: true });

    const gitCloneCommand = await gitCommandBuilder.clone({ url: checkoutUrl });
    runGitCommand(gitCloneCommand, 'Cloning Git repository...', 'Git clone failed');
  }

  if (clean) {
    const gitResetCommand = await gitCommandBuilder.reset();
    runGitCommand(gitResetCommand, 'Resetting Git repository...', 'Git reset failed');

    const gitCleanCommand = await gitCommandBuilder.clean();
    runGitCommand(gitCleanCommand, 'Cleaning Git repository...', 'Git clean failed');
  }

  const gitFetchCommand = await gitCommandBuilder.fetch();
  runGitCommand(gitFetchCommand, 'Fetching Git repository...', 'Git fetch failed');

  if (tag) {
    const gitCheckoutCommand = await gitCommandBuilder.checkout({ tag });
    runGitCommand(gitCheckoutCommand, 'Checking out Git repository using tag...', 'Git checkout failed');
  } else if (branch) {
    const gitCheckoutCommand = await gitCommandBuilder.checkout({ branch });
    runGitCommand(gitCheckoutCommand, 'Checking out Git repository using branch...', 'Git checkout failed');

    const commit = `origin/${branch}`;
    const gitResetCommand = await gitCommandBuilder.reset({
      commit,
    });
    runGitCommand(gitResetCommand, `Resetting Git repository to ${commit}...`, 'Git reset failed');
  }
}
