import { ActionKit, AppVersion, checkoutProject, downloadApp, errorify, isAppVersion, stringify } from '@dogu-tech/action-kit';
import { tryToQuitGamiumApp } from '@dogu-tech/toolkit';
import path from 'path';

ActionKit.run(async ({ options, logger, input, deviceHostClient, consoleActionClient, deviceClient }) => {
  const { DOGU_ROUTINE_WORKSPACE_PATH, DOGU_DEVICE_PLATFORM, DOGU_HOST_WORKSPACE_PATH, DOGU_DEVICE_SERIAL } = options;
  const clean = input.get<boolean>('clean');
  const appVersion = input.get<AppVersion>('appVersion');
  if (!isAppVersion(appVersion)) {
    throw new Error(`Invalid app version: ${stringify(appVersion)}`);
  }

  const resolvedAppVersion = appVersion || process.env.DOGU_APP_VERSION || '';
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
  const gamiumEnginePort = input.get<number>('gamiumEnginePort');
  const uninstallApp = input.get<boolean>('uninstallApp');
  const retryCount = input.get<number>('retryCount');
  const retryInterval = input.get<number>('retryInterval');
  const requestTimeout = input.get<number>('requestTimeout');
  const branchOrTag = input.get<string>('branchOrTag');
  const checkoutPath = input.get<string>('checkoutPath');
  const checkoutUrl = input.get<string>('checkoutUrl');

  logger.info('resolve checkout path... from', { DOGU_ROUTINE_WORKSPACE_PATH, checkoutPath });
  const resolvedCheckoutPath = path.resolve(DOGU_ROUTINE_WORKSPACE_PATH, checkoutPath);
  logger.info('resolved checkout path', { resolvedCheckoutPath });

  await checkoutProject(logger, consoleActionClient, deviceHostClient, resolvedCheckoutPath, branchOrTag, clean, checkoutUrl);

  const appPath = await downloadApp(logger, consoleActionClient, deviceHostClient, DOGU_DEVICE_PLATFORM, DOGU_HOST_WORKSPACE_PATH, currentPlatformAppVersion);
  await tryToQuitGamiumApp(logger, deviceClient, deviceHostClient, gamiumEnginePort, DOGU_DEVICE_SERIAL, DOGU_DEVICE_PLATFORM, retryCount, retryInterval, requestTimeout);
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
});
