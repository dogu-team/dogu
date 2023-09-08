import { Printable } from '@dogu-tech/common';
import { checkDirectoryEqual, copyDirectoryRecursive, getDirectorySize, HostPaths } from '@dogu-tech/node';
import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';

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
      await fs.promises.rm(idaRootDirectoryPath, { force: true, recursive: true });
      logger.info(`removeiOSDeviceAgent done`);
    } catch (e) {
      logger.error(`Error removing directory: ${e}`);
    }
  }
}

export async function checkProjectEqual(logger: Printable): Promise<boolean> {
  const compareTargetDirNames = ['DoguDev', 'DoguDevRunner', 'DoguRunner', 'DoguScreen', 'IOSDeviceAgentLib'];
  for (const dirname of compareTargetDirNames) {
    const idaOriginProjectDirectoryPath = path.resolve(HostPaths.thirdParty.pathMap().macos.iosDeviceAgentProject, dirname);
    const idaDestProjectDirectoryPath = path.resolve(HostPaths.external.xcodeProject.idaProjectDirectoryPath(), dirname);
    const result = await checkDirectoryEqual(idaOriginProjectDirectoryPath, idaDestProjectDirectoryPath, '.swift');
    logger.info(`checkProjectEqual: dirname:${dirname}, isEqual:${result.isEqual}, reason: ${result.reason}`);
    if (!result.isEqual) {
      return false;
    }
  }

  return true;
}
