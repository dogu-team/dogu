import { Printable, PromiseOrValue, stringify } from '@dogu-tech/common';
import { DeviceClient, DeviceClientOptions, DeviceClients, DeviceClientsFactory } from '@dogu-tech/device-client';
import { Logger, LoggerFactory } from '@dogu-tech/node';
import { PlatformType } from '@dogu-tech/types';

export function createLogger(category: string): Logger {
  return LoggerFactory.createLazy(category, { withFileTransports: true });
}

export async function createDeviceClients(options: DeviceClientOptions): Promise<DeviceClients> {
  const factory = new DeviceClientsFactory(options);
  const { port, printable } = factory.options;
  const isPortReachableModule = await import('is-port-reachable');
  const isPortReachable = isPortReachableModule.default;
  const isPortReachableResult = await isPortReachable(port, { host: '127.0.0.1' });
  if (!isPortReachableResult) {
    throw new Error(`Device server is not reachable at port ${port}. Please check DOGU_DEVICE_SERVER_PORT and Device Server is running.`);
  }
  printable.info("Creating device server device and device's host query client...");
  return factory.create();
}

export async function findDevice(deviceClient: DeviceClient, devicePlatform: PlatformType): Promise<string> {
  const platformSerials = await deviceClient.getPlatformSerials();
  const serial = platformSerials.find(({ platform }) => platform === devicePlatform)?.serial ?? '';
  if (!serial) {
    throw new Error(`Cannot find device with platform ${devicePlatform}, list: ${stringify(platformSerials)}`);
  }
  return serial;
}

export type PrepareStep = <R>(name: string, onStep: () => PromiseOrValue<R>) => Promise<R>;

export class Preparer {
  constructor(private readonly printable: Printable) {}

  async prepare<R>(onPrepare: (step: PrepareStep, printable: Printable) => Promise<R>): Promise<R> {
    const { printable } = this;
    printable.info('Preparing 🛠');
    const result = await onPrepare(async (name, onStep) => {
      printable.info(`${name} - Started 🚀`);
      try {
        const result = await onStep();
        printable.info(`${name} - Finished 🏁`);
        return result;
      } catch (error) {
        printable.error(`${name} - Failed 💥`);
        throw error;
      }
    }, printable);
    printable.info('Prepared 🛠');
    return result;
  }
}
