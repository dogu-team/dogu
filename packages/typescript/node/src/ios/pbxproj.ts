import { Xcode } from 'pbxproj-dom/xcode';

export class Pbxproj {
  private readonly xcode: Xcode;
  constructor(private readonly filePath: string) {
    this.xcode = Xcode.open(filePath);
  }

  getSingingStyle(targetName: string): 'Automatic' | 'Manual' | 'None' {
    const configs = this.xcode.document.targets.find((target) => target.name === targetName)?.buildConfigurationsList.buildConfigurations;
    if (!configs) {
      return 'None';
    }
    for (const config of configs) {
      const buildSettings = config.ast.get('buildSettings');
      const type = buildSettings.get('CODE_SIGN_STYLE').text;
      if (type === 'Automatic') {
        return 'Automatic';
      }
      if (type === 'Manual') {
        return 'Manual';
      }
    }

    return 'None';
  }
}
