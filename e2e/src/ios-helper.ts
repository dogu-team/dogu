import { copyDirectoryRecursive, HostPaths } from '@dogu-tech/node';

import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';

import { Xcode } from 'pbxproj-dom/xcode';
import { pathMap } from './path-map';

function replaceXcodeSigningStyle(pbxprojPath: string, targetName: string): void {
  const xcode = Xcode.open(pbxprojPath);
  xcode.setAutomaticSigningStyle(targetName, 'THJJSQ3S6P');
  xcode.save();
}

export function replaceWebDriverAgentSigningStyle(): void {
  const pbxprojPath = path.resolve(HostPaths.external.xcodeProject.wdaProjectDirectoryPath(), 'WebDriverAgent.xcodeproj', 'project.pbxproj');
  replaceXcodeSigningStyle(pbxprojPath, 'WebDriverAgentRunner');
}

export function replaceIosDeviceAgentSigningStyle(): void {
  const pbxprojPath = path.resolve(HostPaths.external.xcodeProject.idaProjectDirectoryPath(), 'IOSDeviceAgent.xcodeproj', 'project.pbxproj');
  replaceXcodeSigningStyle(pbxprojPath, 'DoguRunner');
}

export async function copyIosDeviceAgentProject(): Promise<void> {
  const idaOriginProjectDirectoryPath = path.resolve(pathMap.root, 'projects/ios-device-agent/IOSDeviceAgent');
  const idaDestProjectDirectoryPath = HostPaths.external.xcodeProject.idaProjectDirectoryPath();
  if (fs.existsSync(idaDestProjectDirectoryPath)) {
    await fs.promises.rm(idaDestProjectDirectoryPath, { force: true, recursive: true });
  }

  await fsPromise.mkdir(idaDestProjectDirectoryPath, { recursive: true });
  await copyDirectoryRecursive(idaOriginProjectDirectoryPath, idaDestProjectDirectoryPath, console);
}
