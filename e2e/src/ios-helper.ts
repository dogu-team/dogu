import { HostPaths } from '@dogu-tech/node';
import { Xcode } from 'pbxproj-dom/xcode';

export function replaceWebDriverAgentSigningStyle(): void {
  const xcode = Xcode.open(HostPaths.external.xcodeProject.wdaProjectDirectoryPath());
  xcode.setAutomaticSigningStyle('WebDriverAgentRunner', 'THJJSQ3S6P');
  xcode.save();
}
