import { HostPaths } from '@dogu-tech/node';
import path from 'path';
import { Xcode } from 'pbxproj-dom/xcode';

export function replaceWebDriverAgentSigningStyle(): void {
  const pbxprojPath = path.resolve(HostPaths.external.xcodeProject.wdaProjectDirectoryPath(), 'WebDriverAgent.xcodeproj', 'project.pbxproj');
  const xcode = Xcode.open(pbxprojPath);
  xcode.setAutomaticSigningStyle('WebDriverAgentRunner', 'THJJSQ3S6P');
  xcode.save();
}
