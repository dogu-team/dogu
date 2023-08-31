import { ActionKit, checkoutProject, downloadApp, errorify, stringify } from '@dogu-tech/action-kit';
import { spawnSync } from 'child_process';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';

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

  const command = input.get<string>('command');

  if (checkout) {
    logger.info('resolve checkout path... from', { DOGU_ROUTINE_WORKSPACE_PATH, checkoutPath });
    const resolvedCheckoutPath = path.resolve(DOGU_ROUTINE_WORKSPACE_PATH, checkoutPath);
    logger.info('resolved checkout path', { resolvedCheckoutPath });

    await checkoutProject(logger, consoleActionClient, deviceHostClient, resolvedCheckoutPath, branchOrTag, clean, checkoutUrl);
  }

  let appPath = '';
  if (appVersion) {
    const currentPlatformAppVersion =
      typeof appVersion === 'object'
        ? (() => {
            const platformAppVersion = Reflect.get(appVersion, DOGU_DEVICE_PLATFORM) as string | undefined;
            if (!platformAppVersion) {
              throw new Error(`Invalid app version: ${stringify(appVersion)} for platform: ${DOGU_DEVICE_PLATFORM}`);
            }
            return platformAppVersion;
          })()
        : String(appVersion);
    appPath = await downloadApp(logger, consoleActionClient, deviceHostClient, DOGU_DEVICE_PLATFORM, DOGU_HOST_WORKSPACE_PATH, currentPlatformAppVersion);
  }

  if (appPath) {
    if (uninstallApp) {
      logger.info('Uninstalling app...', { appPath });
      try {
        await deviceClient.uninstallApp(DOGU_DEVICE_SERIAL, appPath);
        logger.info('App uninstalled');
      } catch (error) {
        logger.warn('Failed to uninstall app', { error: errorify(error) });
      }
    }

    logger.info('Installing app...', { appPath });
    await deviceClient.installApp(DOGU_DEVICE_SERIAL, appPath);
    logger.info('App installed');
    logger.info('Run app...', { appPath });
    await deviceClient.runApp(DOGU_DEVICE_SERIAL, appPath);
    logger.info('App runned');
  }

  let env = process.env;
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

  const onelineCommand = command
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line)
    .join(' && ');

  logger.info(`Run command: [${onelineCommand}] on ${DOGU_STEP_WORKING_PATH}`);
  const result = spawnSync(onelineCommand, {
    stdio: 'inherit',
    shell: true,
    cwd: DOGU_STEP_WORKING_PATH,
    env,
  });
  if (result.status === 0) {
    logger.info(`Command succeed: [${onelineCommand}] with status: ${result.status}`);
  } else {
    throw new Error(`Command failed: [${onelineCommand}] with status: ${result.status}`);
  }
});
