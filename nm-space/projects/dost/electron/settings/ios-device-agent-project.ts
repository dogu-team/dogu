import { Printable } from '@dogu-tech/common';
import { copyDirectoryRecursive, getDirectorySize, HostPaths, removeItemRecursive } from '@dogu-tech/node';
import fs from 'fs';
import fsPromise from 'fs/promises';

export async function validateiOSDeviceAgentProjectExist(logger: Printable): Promise<boolean> {
  const idaDestProjectDirectoryPath = HostPaths.external.xcodeProject.idaProjectDirectoryPath();
  if (fs.existsSync(idaDestProjectDirectoryPath)) {
    try {
      const size = await getDirectorySize(idaDestProjectDirectoryPath);
      if (size < 2) {
        return false;
      } else {
        return true;
      }
    } catch (e) {
      logger.error(`Error removing directory: ${e}`);
    }
  }
  return false;
}

export async function copyiOSDeviceAgentProject(logger: Printable): Promise<void> {
  const idaOriginProjectDirectoryPath = HostPaths.thirdParty.pathMap().macos.iosDeviceAgentProject;
  const idaDestProjectDirectoryPath = HostPaths.external.xcodeProject.idaProjectDirectoryPath();

  await fsPromise.mkdir(idaDestProjectDirectoryPath, { recursive: true });
  await copyDirectoryRecursive(idaOriginProjectDirectoryPath, idaDestProjectDirectoryPath, logger);
}

export async function removeiOSDeviceAgent(logger: Printable): Promise<void> {
  const idaRootDirectoryPath = HostPaths.external.xcodeProject.idaRootDirectoryPath();
  logger.info(`removeiOSDeviceAgent: ${idaRootDirectoryPath}`);
  if (fs.existsSync(idaRootDirectoryPath)) {
    try {
      await removeItemRecursive(idaRootDirectoryPath);
      logger.info(`removeiOSDeviceAgent done`);
    } catch (e) {
      logger.error(`Error removing directory: ${e}`);
    }
  }
}
