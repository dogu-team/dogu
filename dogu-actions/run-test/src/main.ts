import { ActionKit, assertUnreachable, checkoutProject, downloadApp, errorify, stringify } from '@dogu-tech/action-kit';
import { exec, spawnSync } from 'child_process';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);
const pythonCheckTimeout = 10_000;

const TestEnvironment = ['node', 'python'] as const;
type TestEnvironment = (typeof TestEnvironment)[number];
const isValidTestEnvironment = (value: string): value is TestEnvironment => TestEnvironment.includes(value as TestEnvironment);

ActionKit.run(async ({ options, logger, input, deviceHostClient, consoleActionClient, deviceClient }) => {
  const {
    DOGU_LOG_LEVEL, //
    DOGU_ROUTINE_WORKSPACE_PATH,
    DOGU_DEVICE_PLATFORM,
    DOGU_HOST_WORKSPACE_PATH,
    DOGU_DEVICE_SERIAL,
    DOGU_STEP_WORKING_PATH,
    DOGU_BROWSER_NAME,
    DOGU_BROWSER_VERSION,
  } = options;
  logger.info('log level', { DOGU_LOG_LEVEL });

  const checkout = input.get<boolean>('checkout');
  const branchOrTag = input.get<string>('branchOrTag');
  const clean = input.get<boolean>('clean');
  const checkoutPath = input.get<string>('checkoutPath');
  const checkoutUrl = input.get<string>('checkoutUrl');

  const appVersion = input.get<string>('appVersion');
  const uninstallApp = input.get<boolean>('uninstallApp');
  const installApp = input.get<boolean>('installApp');
  const runApp = input.get<boolean>('runApp');

  const environment = input.get<string>('environment');
  const command = input.get<string>('command');

  if (!isValidTestEnvironment(environment)) {
    throw new Error(`Invalid environment: ${environment}`);
  }

  if (checkout) {
    logger.info('resolve checkout path... from', { DOGU_ROUTINE_WORKSPACE_PATH, checkoutPath });
    const resolvedCheckoutPath = path.resolve(DOGU_ROUTINE_WORKSPACE_PATH, checkoutPath);
    logger.info('resolved checkout path', { resolvedCheckoutPath });

    await checkoutProject(logger, consoleActionClient, deviceHostClient, resolvedCheckoutPath, branchOrTag, clean, checkoutUrl);
  }

  let appPath = '';
  const resolvedAppVersion = appVersion || process.env.DOGU_APP_VERSION || '';
  if (resolvedAppVersion) {
    const currentPlatformAppVersion =
      typeof resolvedAppVersion === 'object'
        ? (() => {
            const platformAppVersion = Reflect.get(resolvedAppVersion, DOGU_DEVICE_PLATFORM) as string | undefined;
            if (!platformAppVersion) {
              throw new Error(`Invalid app version: ${stringify(resolvedAppVersion)} for platform: ${DOGU_DEVICE_PLATFORM}`);
            }
            return platformAppVersion;
          })()
        : String(resolvedAppVersion);
    appPath = await downloadApp(logger, consoleActionClient, deviceHostClient, DOGU_DEVICE_PLATFORM, DOGU_HOST_WORKSPACE_PATH, currentPlatformAppVersion);
  }

  let env = process.env;
  if (appPath) {
    const appEnv = {
      DOGU_APP_PATH: appPath,
    };

    logger.info('update env for app and driver', {
      ...appEnv,
    });
    env = _.merge(env, appEnv);

    if (uninstallApp) {
      logger.info('Uninstalling app...', { appPath });
      try {
        await deviceClient.uninstallApp(DOGU_DEVICE_SERIAL, appPath);
        logger.info('App uninstalled');
      } catch (error) {
        logger.warn('Failed to uninstall app', { error: errorify(error) });
      }
    }

    if (installApp) {
      logger.info('Installing app...', { appPath });
      await deviceClient.installApp(DOGU_DEVICE_SERIAL, appPath);
      logger.info('App installed');
    }
    if (runApp) {
      logger.info('Run app...', { appPath });
      await deviceClient.runApp(DOGU_DEVICE_SERIAL, appPath);
      logger.info('App runned');
    }
  }

  if (DOGU_BROWSER_NAME) {
    logger.info('Ensure browser and driver...', { DOGU_BROWSER_NAME, DOGU_BROWSER_VERSION });
    const {
      browserName: ensuredBrowserName,
      browserVersion: ensuredBrowserVersion,
      browserPath,
      browserPackageName,
      browserDriverPath,
      browserMajorVersion,
    } = await deviceHostClient.ensureBrowserAndDriver({
      browserName: DOGU_BROWSER_NAME,
      browserPlatform: DOGU_DEVICE_PLATFORM,
      browserVersion: DOGU_BROWSER_VERSION,
      deviceSerial: DOGU_DEVICE_SERIAL,
    });
    const browserEnv = {
      DOGU_BROWSER_NAME: ensuredBrowserName,
      DOGU_BROWSER_VERSION: ensuredBrowserVersion || '',
      DOGU_BROWSER_MAJOR_VERSION: browserMajorVersion ? String(browserMajorVersion) : '',
      DOGU_BROWSER_PATH: browserPath || '',
      DOGU_BROWSER_DRIVER_PATH: browserDriverPath,
      DOGU_BROWSER_PACKAGE_NAME: browserPackageName || '',
    };

    logger.info('update env for browser and driver', {
      ...browserEnv,
    });

    env = _.merge(env, browserEnv);
  }

  await fs.promises.mkdir(DOGU_STEP_WORKING_PATH, { recursive: true });

  const prefixCommands: string[] = [];
  switch (environment) {
    case 'node':
      {
        // noop
      }
      break;
    case 'python':
      {
        const pythonExe = process.platform === 'win32' ? 'python' : 'python3';
        try {
          await execAsync(`${pythonExe} --version`, { timeout: pythonCheckTimeout });
        } catch (error) {
          throw new Error(
            `Please ensure command [${pythonExe}] 🐍 first. if you are using macos, please read this https://docs.dogutech.io/device-farm/host/macos/advanced-configuration`,
          );
        }

        prefixCommands.push(`${pythonExe} -m venv .venv`);
        if (process.platform === 'win32') {
          prefixCommands.push('.venv\\Scripts\\activate.bat');
        } else {
          prefixCommands.push('source .venv/bin/activate');
        }
      }
      break;
    default:
      assertUnreachable(environment);
      throw new Error(`Unexpected environment: ${environment}`);
  }

  const onelineCommands = command
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line);

  const executeCommands = [...prefixCommands, ...onelineCommands];
  const executeCommand = executeCommands.join(' && ');

  logger.info(`Run command: [${executeCommand}] on ${DOGU_STEP_WORKING_PATH}`);
  const result = spawnSync(executeCommand, {
    encoding: 'utf8',
    stdio: 'inherit',
    shell: true,
    cwd: DOGU_STEP_WORKING_PATH,
    env,
  });
  if (result.status === 0) {
    logger.info(`Command succeed: [${executeCommand}] with status: ${result.status}`);
  } else {
    throw new Error(`Command failed: [${executeCommand}] with status: ${result.status}`);
  }
});
