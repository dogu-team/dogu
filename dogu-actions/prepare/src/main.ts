import { ActionKit, AppVersion, checkoutProject, downloadApp, errorify, isAppVersion, OptionsConfig, stringify } from '@dogu-tech/action-kit';
import { tryToQuitGamiumApp } from '@dogu-tech/toolkit';

ActionKit.run(async ({ options, logger, input, deviceHostClient, consoleActionClient, deviceClient }) => {
  const { DOGU_DEVICE_WORKSPACE_PATH, DOGU_PROJECT_ID, DOGU_DEVICE_PLATFORM, DOGU_HOST_WORKSPACE_PATH, DOGU_DEVICE_SERIAL, DOGU_RUN_TYPE } = options;
  const clean = input.get<boolean>('clean');
  const appVersion = input.get<AppVersion>('appVersion');
  if (!isAppVersion(appVersion)) {
    throw new Error(`Invalid app version: ${stringify(appVersion)}`);
  }
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
  const gamiumEnginePort = input.get<number>('gamiumEnginePort');
  const uninstallApp = input.get<boolean>('uninstallApp');
  const retryCount = input.get<number>('retryCount');
  const retryInterval = input.get<number>('retryInterval');
  const requestTimeout = input.get<number>('requestTimeout');
  const branchOrTag = input.get<string>('branchOrTag');
  const optionsConfig = await OptionsConfig.load();
  if (optionsConfig.get('localUserProject.use', false)) {
    logger.info('Using local user project...');
  } else {
    await checkoutProject(logger, consoleActionClient, deviceHostClient, DOGU_DEVICE_WORKSPACE_PATH, DOGU_PROJECT_ID, branchOrTag, clean);
  }
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
