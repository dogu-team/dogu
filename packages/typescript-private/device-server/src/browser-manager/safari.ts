import { readPlist } from '@dogu-tech/node';
import fs from 'fs';
import { chromeVersionUtils } from './chrome-version-utils';

const versionPlistPath = '/Applications/Safari.app/Contents/version.plist';
const executablePath = '/Applications/Safari.app/Contents/MacOS/Safari';

export const safariVersionUtils = chromeVersionUtils;

interface VersionPlist {
  CFBundleShortVersionString: string;
}

export class Safari {
  async getVersion(): Promise<string> {
    if (process.platform !== 'darwin') {
      throw new Error('Safari is only available on macOS');
    }

    const content = await fs.promises.readFile(versionPlistPath, { encoding: 'utf8' });
    const parsed = readPlist(content) as unknown as VersionPlist;
    if (!parsed.CFBundleShortVersionString) {
      throw new Error(`Could not parse ${versionPlistPath}`);
    }

    return parsed.CFBundleShortVersionString;
  }

  getExecutablePath(): string {
    return executablePath;
  }
}

const safari = new Safari();
safari.getVersion().then(console.log);
