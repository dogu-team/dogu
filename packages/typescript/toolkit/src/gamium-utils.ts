import { errorify, NullLogger, Printable } from '@dogu-tech/common';
import { DeviceClient, DeviceHostClient } from '@dogu-tech/device-client';
import { PlatformType, Serial } from '@dogu-tech/types';
import { createGamiumContext, GamiumContext } from './internal/gamium-context';

export async function tryToQuitGamiumApp(
  printable: Printable,
  deviceClient: DeviceClient,
  deviceHostClient: DeviceHostClient,
  gamiumEnginePort: number,
  deviceSerial: Serial,
  platform: PlatformType,
  retryCount: number,
  retryInterval: number,
  requestTimeout: number,
): Promise<void> {
  let _gamiumContext: GamiumContext | null = null;
  try {
    printable.info('Try to quit previous gamium app...');
    _gamiumContext = await createGamiumContext(
      deviceClient,
      deviceHostClient,
      gamiumEnginePort,
      deviceSerial,
      platform,
      retryCount,
      retryInterval,
      requestTimeout,
      false,
      NullLogger.instance,
    );
    await _gamiumContext.client.actions().appQuit().perform();
  } catch (error) {
    printable.verbose?.('Failed to quit previous gamium app', { error: errorify(error) });
  } finally {
    await _gamiumContext?.close().catch((error) => {
      printable.error('Failed to close gamium context', { error: errorify(error) });
    });
    _gamiumContext = null;
  }
}
