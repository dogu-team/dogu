import { updateProcessEnv } from '@dogu-tech/node';
import { tryToQuitGamiumApp } from './gamium-utils';
import { createDeviceClients, findDevice, Preparer } from './internal/functions';
import { createGamiumContext, GamiumContext } from './internal/gamium-context';
import { logger } from './internal/logger-instance';
import { fillToolkitOptions, ToolkitOptions } from './options';
import { Toolkit } from './toolkit';

export async function prepareToolkit(options?: ToolkitOptions): Promise<Toolkit> {
  updateProcessEnv();
  logger.info('Preparing Toolkit...');
  const filledOptions = fillToolkitOptions(options);
  const { dogu, gamium, appium } = filledOptions;
  const { logLevel, deviceServerPort, requestTimeout, deviceSerial: deviceSerialFromArg, devicePlatform, uninstallApp, appPath } = dogu;
  logger.setLogLevel(logLevel);
  logger.verbose('filledOptions', { filledOptions });

  const result = await new Preparer(logger).prepare(async (step, printable) => {
    const { deviceClient, deviceHostClient } = await step('Create device clients', () => {
      printable.verbose?.('arguments', {
        deviceServerPort,
        requestTimeout,
      });
      return createDeviceClients({ port: deviceServerPort, timeout: requestTimeout, printable });
    });

    let deviceSerial = deviceSerialFromArg;
    if (!deviceSerial) {
      deviceSerial = await step('Find device', async () => {
        printable.verbose?.('arguments', {
          deviceSerial: deviceSerialFromArg,
          devicePlatform,
        });
        return findDevice(deviceClient, devicePlatform);
      });
    }

    await step('Uninstall app', async () => {
      printable.verbose?.('arguments', {
        uninstallApp,
        deviceSerial,
        appPath,
      });
      if (!uninstallApp) {
        printable.info('Skipped.');
        return;
      }
      if (!appPath) {
        throw new Error('DOGU_APP_PATH is required when DOGU_UNINSTALL_APP is true.');
      }
      await deviceClient.uninstallApp(deviceSerial, appPath);
    });

    if (gamium) {
      const { enginePort, retryCount, retryInterval, quitApp } = gamium;
      await step('Try to quit previous gamium app', async () => {
        printable.verbose?.('arguments', {
          enginePort,
          deviceSerial,
          retryCount,
          retryInterval,
          requestTimeout,
        });
        if (!quitApp) {
          printable.info('Skipped.');
          return;
        }
        await tryToQuitGamiumApp(printable, deviceClient, deviceHostClient, enginePort, deviceSerial, devicePlatform, retryCount, retryInterval, requestTimeout);
      });
    }

    await step('Install app', async () => {
      printable.verbose?.('arguments', {
        deviceSerial,
        appPath,
      });
      if (!appPath) {
        printable.info('Skipped.');
        return;
      }
      await deviceClient.installApp(deviceSerial, appPath);
    });

    await step('Run app', async () => {
      printable.verbose?.('arguments', {
        deviceSerial,
        appPath,
      });
      if (!appPath) {
        printable.info('Skipped.');
        return;
      }
      await deviceClient.runApp(deviceSerial, appPath);
    });

    let gamiumContext: GamiumContext | null = null;
    if (gamium) {
      const { enginePort, retryCount, retryInterval } = gamium;
      gamiumContext = await step('Create gamium context', async () => {
        printable.verbose?.('arguments', {
          enginePort,
          deviceSerial,
          retryCount,
          retryInterval,
          requestTimeout,
        });
        return createGamiumContext(deviceClient, deviceHostClient, enginePort, deviceSerial, devicePlatform, retryCount, retryInterval, requestTimeout, false, printable);
      });
    }

    let appiumContext: WebdriverIO.Browser | null = null;
    if (appium) {
      appiumContext = await step('Create Appium context', async () => {
        const appiumContextInfo = await deviceClient.getAppiumContextInfo(deviceSerial);
        const webdriverioModule = await import('webdriverio');
        const browser = await webdriverioModule.attach({
          port: appiumContextInfo.server.port,
          sessionId: appiumContextInfo.sessionId,
          capabilities: appiumContextInfo.capabilities,
        });
        return browser;
      });
    }

    return { deviceClient, deviceHostClient, gamiumContext, appiumContext };
  });

  const { deviceClient, deviceHostClient, gamiumContext, appiumContext } = result;
  return new Toolkit(logger, filledOptions, deviceClient, deviceHostClient, gamiumContext, appiumContext);
}
