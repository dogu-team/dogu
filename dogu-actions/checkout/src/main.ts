import { ActionKit, checkoutProject, newCleanNodeEnv } from '@dogu-tech/action-kit';
import { spawnSync } from 'child_process';
import path from 'path';

ActionKit.run(async ({ options, logger, input, deviceHostClient, consoleActionClient }) => {
  const { DOGU_ROUTINE_WORKSPACE_PATH } = options;
  const clean = input.get<boolean>('clean');
  const branch = input.get<string>('branch');
  const tag = input.get<string>('tag');
  const postCommand = input.get<string>('postCommand');
  const checkoutPath = input.get<string>('checkoutPath');
  const checkoutUrl = input.get<string>('checkoutUrl');

  logger.info('resolve checkout path... from', { DOGU_ROUTINE_WORKSPACE_PATH, checkoutPath });
  const resolvedCheckoutPath = path.resolve(DOGU_ROUTINE_WORKSPACE_PATH, checkoutPath);
  logger.info('resolved checkout path', { resolvedCheckoutPath });

  await checkoutProject(logger, consoleActionClient, deviceHostClient, resolvedCheckoutPath, clean, branch, tag, checkoutUrl);
  const workspacePath = resolvedCheckoutPath;

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
});
