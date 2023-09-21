import {
  AppConfigLoader,
  ChildListener,
  ChildServiceFactory,
  DotenvConfigLoader,
  ExternalServiceFactory,
  FeatureConfigLoader,
  UnitCallbackFactory,
} from '@dogu-private/dogu-agent-core/app';
import { HostPaths, LoggerFactory } from '@dogu-tech/node';

export async function run(url: string, token: string, linuxDeviceSerial: string) {
  const runType = process.env.DOGU_RUN_TYPE;
  const appName = 'dogu-agent-cli' + (runType ? `-${runType?.toLowerCase()}` : '');
  const logger = LoggerFactory.create(appName);
  const configsPath = HostPaths.configsPath(HostPaths.doguHomePath);
  const logsPath = HostPaths.logsPath(HostPaths.doguHomePath);
  const thirdPartyPathMap = HostPaths.thirdParty.pathMap();

  const appConfigService = await new AppConfigLoader({
    configsPath,
    logger,
    appName,
    dotenvSearchPaths: [process.cwd()],
  }).load();
  appConfigService.set('DOGU_API_BASE_URL', url);
  appConfigService.set('DOGU_HOST_TOKEN', token);
  appConfigService.set('DOGU_DEVICE_PLATFORM_ENABLED', 'windows,macos,linux');
  if (!appConfigService.getOrDefault('DOGU_LINUX_DEVICE_SERIAL', '')) {
    appConfigService.set('DOGU_LINUX_DEVICE_SERIAL', linuxDeviceSerial);
  }

  const featureConfigService = await new FeatureConfigLoader({
    appConfigService,
    logger,
  }).load();

  const dotenvConfigService = await new DotenvConfigLoader({
    appConfigService,
    configsPath,
    logger,
  }).load();

  const unitCallbackFactory: UnitCallbackFactory = (key) => ({
    onDownloadStarted: () => {
      /* noop */
    },
    onDownloadInProgress: (progress) => {
      /* noop */
    },
    onDownloadCompleted: () => {
      /* noop */
    },
    onInstallStarted: () => {
      /* noop */
    },
    onInstallCompleted: () => {
      /* noop */
    },
  });
  const externalService = await new ExternalServiceFactory({
    appConfigService,
    dotenvConfigService,
    thirdPartyPathMap,
    logger,
    unitCallbackFactory,
  }).create();
  if (!(await externalService.updateIsSupportedPlatformValid())) {
    for (const key of await externalService.getSupportedPlatformKeys()) {
      const unit = externalService.getUnit(key);
      if (unit.isInstallNeeded()) {
        await unit.install();
        await unit.validate();
      }
    }
  }

  const childListener: ChildListener = {
    onStdout: (key, data) => {
      /* noop */
    },
    onStderr: (key, data) => {
      /* noop */
    },
    onClose: (key, code) => {
      /* noop */
    },
  };
  const childService = new ChildServiceFactory({
    appConfigService,
    externalService,
    logsPath,
    logger,
    listener: childListener,
  }).create();
  const result = await childService.connect(token);
  logger.info('child service connected', { result });
}
