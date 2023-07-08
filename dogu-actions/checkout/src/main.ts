import { ActionKit, checkoutProject, HostPaths, newCleanNodeEnv, OptionsConfig } from '@dogu-tech/action-kit';
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

    if (postCommand) {
      logger.info('Running post command...');
      const command = process.platform === 'win32' ? process.env.COMSPEC || 'cmd.exe' : process.env.SHELL || '/bin/sh';
      const args = process.platform === 'win32' ? ['/d', '/s', '/c'] : ['-c'];
      args.push(postCommand);
      logger.info('Running command', { command, args });
      const result = spawnSync(postCommand, {
        stdio: 'inherit',
        cwd: deviceProjectGitPath,
        env: newCleanNodeEnv(),
      });
      logger.verbose?.('Command result', { result });
      if (result.status !== 0) {
        throw new Error(`Post command failed with status ${result.status}`);
      }
    }
  }
});
