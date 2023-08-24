import { Printable } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import fs from 'fs';

export async function removeWdaDeviceAgent(logger: Printable): Promise<void> {
  const wdaBuildDirectorypaths = [HostPaths.external.xcodeProject.wdaDerivedDataPath(), HostPaths.external.xcodeProject.wdaDerivedDataClonePath()];
  logger.info(`removeWdaDeviceAgent: `, { wdaBuildDirectorypaths });
  for (const path of wdaBuildDirectorypaths) {
    if (fs.existsSync(path)) {
      try {
        await fs.promises.rm(path, { recursive: true, force: true });
        logger.info(`removeWdaDeviceAgent: done`);
      } catch (e) {
        logger.error(`Error removing directory: ${e}`);
      }
    }
  }
}
