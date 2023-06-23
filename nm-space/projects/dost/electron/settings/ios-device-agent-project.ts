import { Printable } from '@dogu-tech/common';
import { copyDirectoryRecursive, HostPaths } from '@dogu-tech/node';
import fs from 'fs';
import fsPromise from 'fs/promises';

export async function copyiOSDeviceAgentProject(logger: Printable): Promise<void> {
  const idaOriginProjectDirectoryPath = HostPaths.thirdParty.pathMap().macos.iosDeviceAgentProject;
  const idaDestProjectDirectoryPath = HostPaths.external.xcodeProject.idaProjectDirectoryPath();
  if (fs.existsSync(idaDestProjectDirectoryPath)) {
    return;
  }

  await fsPromise.mkdir(idaDestProjectDirectoryPath, { recursive: true });
  await copyDirectoryRecursive(idaOriginProjectDirectoryPath, idaDestProjectDirectoryPath, logger);
}
