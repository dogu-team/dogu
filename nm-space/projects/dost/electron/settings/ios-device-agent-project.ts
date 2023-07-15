import { Printable } from '@dogu-tech/common';
import { copyDirectoryRecursive, getDirectorySize, HostPaths, removeItemRecursive } from '@dogu-tech/node';
import fs from 'fs';
import fsPromise from 'fs/promises';

export async function copyiOSDeviceAgentProject(logger: Printable): Promise<void> {
  const idaOriginProjectDirectoryPath = HostPaths.thirdParty.pathMap().macos.iosDeviceAgentProject;
  const idaDestProjectDirectoryPath = HostPaths.external.xcodeProject.idaProjectDirectoryPath();
  if (fs.existsSync(idaDestProjectDirectoryPath)) {
    try {
      const size = await getDirectorySize(idaDestProjectDirectoryPath);
      if (size < 10) {
        await removeItemRecursive(idaDestProjectDirectoryPath);
      } else {
        return;
      }
    } catch (e) {
      logger.error(`Error removing directory: ${e}`);
    }
  }

  await fsPromise.mkdir(idaDestProjectDirectoryPath, { recursive: true });
  await copyDirectoryRecursive(idaOriginProjectDirectoryPath, idaDestProjectDirectoryPath, logger);
}

export async function removeiOSDeviceAgentProject(logger: Printable): Promise<void> {
  const idaDestProjectDirectoryPath = HostPaths.external.xcodeProject.idaProjectDirectoryPath();
  if (fs.existsSync(idaDestProjectDirectoryPath)) {
    try {
      await removeItemRecursive(idaDestProjectDirectoryPath);
    } catch (e) {
      logger.error(`Error removing directory: ${e}`);
    }
  }
}
