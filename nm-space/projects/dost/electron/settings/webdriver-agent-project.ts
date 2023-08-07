import { Printable } from '@dogu-tech/common';
import { HostPaths, removeItemRecursive } from '@dogu-tech/node';
import fs from 'fs';

export async function removeWdaDeviceAgent(logger: Printable): Promise<void> {
  const wdaBuildDirectorypath = HostPaths.external.xcodeProject.wdaDerivedDataPath();
  logger.info(`removeWdaDeviceAgent: ${wdaBuildDirectorypath}`);
  if (fs.existsSync(wdaBuildDirectorypath)) {
    try {
      await removeItemRecursive(wdaBuildDirectorypath);
      logger.info(`removeWdaDeviceAgent: done`);
    } catch (e) {
      logger.error(`Error removing directory: ${e}`);
    }
  }
}
