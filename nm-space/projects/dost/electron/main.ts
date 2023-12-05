import { app, BrowserWindow } from 'electron';
import { logger, rendererLogger } from './log/logger.instance';

/**
 * @note process.env.DOGU_PACKAGED_RESOURCES_PATH and process.env.DOGU_APP_VERSION is used in self and child processes.
 */
((): void => {
  process.env.DOGU_PACKAGED_RESOURCES_PATH = app.isPackaged ? process.resourcesPath : '';
  process.env.DOGU_AGENT_VERSION = app.getVersion();
  logger.info('bootstrap', {
    DOGU_PACKAGED_RESOURCES_PATH: process.env.DOGU_PACKAGED_RESOURCES_PATH,
    DOGU_AGENT_VERSION: process.env.DOGU_AGENT_VERSION,
  });
})();

import { DeviceAuthService } from '@dogu-private/dogu-agent-core/app';
import { errorify, stringify } from '@dogu-tech/common';
import { killSelfProcess, maxLogPeriod, openDeleteOldFiles } from '@dogu-tech/node';
import * as Sentry from '@sentry/electron/main';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import isDev from 'electron-is-dev';
import { SentyDSNUrl } from '../src/shares/constants';
import { AppConfigService } from './app-config/app-config-service';
import { AppStatusService } from './app-status/app-status-service';
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

const isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  WindowService.open();
});

AppConfigService.open();
FeatureConfigService.open(AppConfigService.instance);
if (FeatureConfigService.instance.get('useSentry')) {
  Sentry.init({ dsn: SentyDSNUrl, maxBreadcrumbs: 10000, environment: isDev ? 'development' : 'production' });
}

app
  .whenReady()
  .then(async () => {
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
      .catch((e) => logger.error('An error occurred: ', { error: errorify(e) }));

    await openDeleteOldLogs();

    await AppStatusService.instance.openServices(async () => {
      const authService = new DeviceAuthService(logger);

      RendererLogService.open();
      ThemeService.open();

      await DotEnvConfigService.open(AppConfigService.instance);
      SettingsService.open(DotEnvConfigService.instance);
      TrayService.open(SettingsService.instance);
      WindowService.open();
      StdLogCallbackService.open(WindowService.instance);
      await ExternalService.open(DotEnvConfigService.instance, StdLogCallbackService.instance, AppConfigService.instance, WindowService.instance);
      ChildService.open(AppConfigService.instance, FeatureConfigService.instance, ExternalService.instance, authService);
      await DeviceLookupService.open(ChildService.instance, AppConfigService.instance, authService);
      const token = await AppConfigService.instance.get<string>('DOGU_HOST_TOKEN');
      if (token && token.length > 0) {
        ChildService.instance.connect(token).catch((e) => logger.error('main connect error', { error: errorify(e) }));
      }
      await UpdaterService.open(AppConfigService.instance, FeatureConfigService.instance, ChildService.instance);
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        WindowService.open();
      }
    });

    app.on('window-all-closed', () => {});

    app.on('quit', (_, exitCode) => {
      (async (): Promise<void> => {
        logger.info('app quit', { exitCode });
        await ChildService.close();
      })().catch((e) => {
        logger.error('app quit error', { error: errorify(e) });
      });
    });
  })
  .catch((e) => {
    logger.error('app error', { error: errorify(e) });
  });

process.on('uncaughtException', (e) => {
  logger.error('uncaughtException', { error: errorify(e) });
});
process.on('unhandledRejection', (reason, promise) => {
  logger.error('unhandledRejection', { reason, promise });
});

const cleanup = (): void => {
  killSelfProcess();
};

async function openDeleteOldLogs(): Promise<void> {
  await openDeleteOldFiles(LogsPath, maxLogPeriod, '1d', logger);
}

const quitSignalAndEvents = ['beforeExit', 'exit', 'SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGABRT'];
for (const event of quitSignalAndEvents) {
  process.on(event, (code) => {
    logger.info(`on process event`, { event, code: stringify(code) });
    cleanup();
  });
}

const quitSignalAndAppEvents = ['before-quit'] as const;
for (const event of quitSignalAndAppEvents) {
  app.on(event, (event: Electron.Event) => {
    logger.info(`on app event`, { event });
    cleanup();
  });
}
