import { errorify } from '@dogu-tech/common';
import { fillToolkitOptions } from '../../options';
import { createDeviceClients, createLogger, findDevice } from '../functions';
import { createGamiumContext } from '../gamium-context';

/**
 * @description The main function of the forked child process in the game profile reporter.
 */
function main(): void {
  const logger = createLogger('game-profile-reporter');
  ['SIGINT', 'SIGTERM'].forEach((event) => {
    process.on(event, () => {
      logger.info(`${event} received`);
      process.exit(0);
    });
  });
  (async (): Promise<void> => {
    logger.info('Preparing Game Profile Reporter...');
    const filledOptions = fillToolkitOptions({ gamium: true });
    const { dogu, gamium } = filledOptions;
    if (!gamium) {
      throw new Error('Gamium options are required.');
    }
    const { logLevel, deviceServerUrl, requestTimeout, deviceSerial: deviceSerialFromArg, devicePlatform } = dogu;
    const { enginePort, retryCount, retryInterval } = gamium;
    logger.setLogLevel(logLevel);
    const { deviceClient, deviceHostClient } = await createDeviceClients({ deviceServerUrl, timeout: requestTimeout, printable: logger });
    let deviceSerial = deviceSerialFromArg;
    if (!deviceSerial) {
      deviceSerial = await findDevice(deviceClient, devicePlatform);
    }
    const gamiumContext = await createGamiumContext(
      deviceClient,
      deviceHostClient,
      enginePort,
      deviceSerial,
      devicePlatform,
      retryCount,
      retryInterval,
      requestTimeout,
      true,
      logger,
    );
    process.on('exit', () => {
      gamiumContext.close().catch((error) => {
        logger.error('Failed to close gamium context', { error: errorify(error) });
      });
    });
  })().catch((error) => {
    logger.error('Game Profile Reporter failed', { error: errorify(error) });
    process.exit(1);
  });
}

main();
