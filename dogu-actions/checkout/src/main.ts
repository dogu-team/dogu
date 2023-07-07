import { ActionKit, checkoutProject, HostPaths, OptionsConfig } from '@dogu-tech/action-kit';
import { spawnSync } from 'child_process';
import fs from 'fs';

ActionKit.run(async ({ options, logger, input, deviceHostClient, consoleActionClient, deviceClient }) => {
  const { DOGU_DEVICE_WORKSPACE_PATH, DOGU_PROJECT_ID } = options;
  const clean = input.get<boolean>('clean');
  const branchOrTag = input.get<string>('branchOrTag');
  const postCommand = input.get<string>('postCommand');
  const optionsConfig = await OptionsConfig.load();
  if (optionsConfig.get('localUserProject.use', false)) {
    logger.info('Using local user project...');
  } else {
    await checkoutProject(logger, consoleActionClient, deviceHostClient, DOGU_DEVICE_WORKSPACE_PATH, DOGU_PROJECT_ID, branchOrTag, clean);
    const deviceProjectWorkspacePath = HostPaths.deviceProjectWorkspacePath(DOGU_DEVICE_WORKSPACE_PATH, DOGU_PROJECT_ID);
    await fs.promises.mkdir(deviceProjectWorkspacePath, { recursive: true });
    const deviceProjectGitPath = HostPaths.deviceProjectGitPath(deviceProjectWorkspacePath);

    function command(command: string, args: string[], logMessage: string, errorMessage: string): void {
      logger.info(logMessage);
      logger.info('Running command', { command: `${command} ${args.join(' ')}` });
      const result = spawnSync(command, args, {
        stdio: 'inherit',
        cwd: deviceProjectGitPath,
      });
      logger.verbose?.('Command result', { result });
      if (result.status !== 0) {
        throw new Error(errorMessage);
      }
    }

    if (postCommand) {
      const shell = process.platform === 'win32' ? process.env.COMSPEC || 'cmd.exe' : process.env.SHELL || '/bin/bash';
      const firstArg = process.platform === 'win32' ? '/c' : '-c';
      command(shell, [firstArg, postCommand], 'Running post command...', 'Post command failed');
    }
  }
});
