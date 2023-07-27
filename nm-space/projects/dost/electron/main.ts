import { app, BrowserWindow } from 'electron';
import { logger, rendererLogger } from './log/logger.instance';

/**
 * @note process.env.DOGU_PACKAGED_RESOURCES_PATH and process.env.DOGU_APP_VERSION is used in self and child processes.
 */
(() => {
  process.env.DOGU_PACKAGED_RESOURCES_PATH = app.isPackaged ? process.resourcesPath : '';
  process.env.DOGU_AGENT_VERSION = app.getVersion();
  logger.info('bootstrap', {
    DOGU_PACKAGED_RESOURCES_PATH: process.env.DOGU_PACKAGED_RESOURCES_PATH,
    DOGU_AGENT_VERSION: process.env.DOGU_AGENT_VERSION,
  });
})();

import { errorify } from '@dogu-tech/common';
import * as Sentry from '@sentry/electron/main';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import electronDl from 'electron-dl';
import isDev from 'electron-is-dev';
import { SentyDSNUrl } from '../src/shares/constants';
import { AppConfigService } from './app-config/app-config-service';
import { ChildService } from './child/child-service';
import { DeviceLookupService } from './device-lookup/device-lookup-service';
import { DotEnvConfigService } from './dot-env-config/dot-env-config-service';
import { ExternalService } from './external/external-service';
import { FeatureConfigService } from './feature-config/feature-config-service';
import { RendererLogService } from './log/renderer-log-service';
import { StdLogCallbackService } from './log/std-log-callback-service';
import { LogsPath } from './path-map';
import { SettingsService } from './settings/settings-service';
import { ThemeService } from './theme/theme-service';
import { TrayService } from './tray/tray-service';
import { UpdaterService } from './updater/updater-service';
import { WindowService } from './window/window-service';

electronDl();

const isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  WindowService.open();
});

app.whenReady().then(async () => {
  logger.addFileTransports(LogsPath);
  rendererLogger.addFileTransports(LogsPath);
  const appInfo = {
    isDev,
    cwd: process.cwd(),
    version: app.getVersion(),
    name: app.getName(),
    path: app.getAppPath(),
    isPackaged: app.isPackaged,
    platform: process.platform,
    systemVersion: process.getSystemVersion(),
    env: process.env,
  };
  logger.info('bootstrap', { appInfo });

  // DevTools
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => logger.info(`Added Extension:  ${name}`))
    .catch((err) => logger.error('An error occurred: ', err));

  RendererLogService.open();
  ThemeService.open();
  await AppConfigService.open();
  await FeatureConfigService.open(AppConfigService.instance);
  if (FeatureConfigService.instance.get('useSentry')) {
    Sentry.init({ dsn: SentyDSNUrl, maxBreadcrumbs: 10000, environment: isDev ? 'development' : 'production' });
  }
  await DotEnvConfigService.open(AppConfigService.instance);
  await UpdaterService.open(AppConfigService.instance, FeatureConfigService.instance);
  SettingsService.open(DotEnvConfigService.instance);
  TrayService.open();
  WindowService.open();
  StdLogCallbackService.open(WindowService.instance);
  await ExternalService.open(DotEnvConfigService.instance, StdLogCallbackService.instance, AppConfigService.instance, WindowService.instance);
  ChildService.open(AppConfigService.instance, FeatureConfigService.instance);
  const token = (await AppConfigService.instance.get('DOGU_HOST_TOKEN')) as string;
  if (token && token.length > 0) {
    ChildService.instance.connect(token).catch((err) => logger.error('main connect error', err));
  }
  DeviceLookupService.open(ChildService.instance);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      WindowService.open();
    }
  });

  app.on('window-all-closed', () => {});

  app.on('quit', async (event, exitCode) => {
    logger.info('app quit', { exitCode });
    await ChildService.close();
  });
});

process.on('uncaughtException', async (error) => {
  logger.error('uncaughtException', { error: errorify(error) });
});
process.on('unhandledRejection', async (reason, promise) => {
  logger.error('unhandledRejection', { reason, promise });
});

const quitSignalAndEvents = ['beforeExit', 'exit', 'SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGKILL', 'SIGSTOP', 'SIGABRT'];
for (const event of quitSignalAndEvents) {
  process.on(event, async (code) => {
    logger.info(event, { event, code });
    await ChildService.close();
  });
}

const quitSignalAndAppEvents = ['before-quit'] as const;
for (const event of quitSignalAndAppEvents) {
  app.on(event, async (event: Event) => {
    logger.info(event, { event });
    await ChildService.close();
  });
}
