import { ActionKit, HostPaths, OptionsConfig } from '@dogu-tech/action-kit';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

ActionKit.run(async ({ options, logger, input, deviceHostClient }) => {
  const { DOGU_LOG_LEVEL, DOGU_DEVICE_PROJECT_WORKSPACE_PATH } = options;
  logger.info('log level', { DOGU_LOG_LEVEL });
  const script = input.get<string>('script');
  const pathMap = await deviceHostClient.getPathMap();
  const { yarn } = pathMap.common;
  let yarnPath = yarn;
  let userProjectPath = path.resolve(HostPaths.deviceProjectGitPath(DOGU_DEVICE_PROJECT_WORKSPACE_PATH));
  const optionsConfig = await OptionsConfig.load();
  const useLocalUserProject = optionsConfig.get('localUserProject.use', false);
  if (useLocalUserProject) {
    logger.info('Using local user project...');

    async function findLocalUserProject(): Promise<string> {
      const searchPaths = optionsConfig.get('localUserProject.searchPaths', []);
      for (const searchPath of searchPaths) {
        const candidate = path.resolve(searchPath);
        logger.info('Checking local user project path', { candidate });
        const doguConfigPath = path.resolve(candidate, 'dogu.config.json');
        const stat = await fs.promises.stat(doguConfigPath).catch(() => null);
        if (stat) {
          return candidate;
        }
      }
      throw new Error(`Local user project not found in search paths: ${searchPaths.join(', ')}`);
    }

    yarnPath = 'yarn';
    userProjectPath = await findLocalUserProject();
  } else {
    logger.info('Using device user project...');
  }

  logger.info('User project path and yarn path', { userProjectPath, yarnPath });

  function runYarn(args: string[]) {
    const command = yarnPath;
    const shell = useLocalUserProject ? true : false;
    logger.info(`Running command: ${command} ${args.join(' ')}`);
    const result = spawnSync(command, args, {
      stdio: 'inherit',
      cwd: userProjectPath,
      shell,
    });
    if (result.status !== 0) {
      throw new Error(`Command failed: ${command} ${args.join(' ')}`);
    }
  }

  if (!optionsConfig.get('localUserProject.use', false)) {
    runYarn(['install']);
    const packageJsonPath = path.resolve(userProjectPath, 'package.json');
    const content = await fs.promises.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(content) as { dependencies?: Record<string, string> };
    const doguDependencies: string[] = [];
    if (packageJson.dependencies) {
      for (const [key, value] of Object.entries(packageJson.dependencies)) {
        if (key.startsWith('@dogu-tech/')) {
          doguDependencies.push(key);
        }
      }
    }
    for (const dependency of doguDependencies) {
      runYarn(['up', '-R', dependency]);
    }
    if (script.endsWith('.ts')) {
      runYarn(['tsc', '-b']);
    }
  }
  if (script.endsWith('.js')) {
    runYarn(['node', script]);
  } else if (script.endsWith('.ts')) {
    runYarn(['ts-node', script]);
  } else {
    throw new Error(`Unexpected script extension: ${script}`);
  }
});
