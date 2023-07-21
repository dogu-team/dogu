import { ActionKit, checkoutProject, newCleanNodeEnv, OptionsConfig } from '@dogu-tech/action-kit';
import { spawnSync } from 'child_process';

ActionKit.run(async ({ options, logger, input, deviceHostClient, consoleActionClient, deviceClient }) => {
  const { DOGU_ROUTINE_WORKSPACE_PATH, DOGU_PROJECT_ID } = options;
  const clean = input.get<boolean>('clean');
  const branchOrTag = input.get<string>('branchOrTag');
  const postCommand = input.get<string>('postCommand');
  const optionsConfig = await OptionsConfig.load();
  if (optionsConfig.get('localUserProject.use', false)) {
    logger.info('Using local user project...');
  } else {
    await checkoutProject(logger, consoleActionClient, deviceHostClient, DOGU_ROUTINE_WORKSPACE_PATH, branchOrTag, clean);
    const workspacePath = DOGU_ROUTINE_WORKSPACE_PATH;

    if (postCommand) {
      logger.info('Running post command...');
      const command = process.platform === 'win32' ? process.env.COMSPEC || 'cmd.exe' : process.env.SHELL || '/bin/sh';
      const args = process.platform === 'win32' ? ['/d', '/s', '/c'] : ['-c'];
      args.push(postCommand);
      logger.info('Running command', { command, args });
      const result = spawnSync(command, args, {
        stdio: 'inherit',
        cwd: workspacePath,
        env: newCleanNodeEnv(),
      });
      logger.verbose?.('Command result', { result });
      if (result.status !== 0) {
        throw new Error(`Post command failed with status ${result.status}`);
      }
    }
  }
});
