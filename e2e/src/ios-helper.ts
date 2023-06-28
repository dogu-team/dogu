import { HostPaths } from '@dogu-tech/node';
import path from 'path';
import { Xcode } from 'pbxproj-dom/xcode';

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
