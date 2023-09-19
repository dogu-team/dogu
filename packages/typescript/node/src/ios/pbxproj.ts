import { Xcode } from 'pbxproj-dom/xcode';

export class Pbxproj {
  private readonly xcode: Xcode;
  constructor(private readonly filePath: string) {
    this.xcode = Xcode.open(filePath);
  }

  getSingingStyle(targetName: string): 'Automatic' | 'Manual' | 'None' {
    const config = this.xcode.document.targets.find((target) => target.name === targetName)?.buildConfigurationsList.buildConfigurations[0];
    if (!config) {
      return 'None';
    }
    var buildSettings = config.ast.get('buildSettings');
    var type = buildSettings.get('CODE_SIGN_STYLE').text;
    if (type === 'Automatic') {
      return 'Automatic';
    }
    if (type === 'Manual') {
      return 'Manual';
    }
    return 'None';
  }
}
