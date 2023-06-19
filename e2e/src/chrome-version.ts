import { spawnSync } from 'child_process';

interface IChromeVersionParseResult {
  success: boolean;
}

interface ChromeVersionParseResultSuccess extends IChromeVersionParseResult {
  success: true;
  version: ChromeVersion;
}

interface ChromeVersionParseResultFailure extends IChromeVersionParseResult {
  success: false;
  version: null;
}

type ChromeVersionParseResult = ChromeVersionParseResultSuccess | ChromeVersionParseResultFailure;

export interface ChromeVersion {
  readonly versionString: string;
  readonly major: number;
  readonly minor: number;
  readonly build: number;
  readonly patch: number;
}

interface IChromeVersionFinder {
  findSync(): ChromeVersion;
}

export class ChromeVersionFinder implements IChromeVersionFinder {
  findSync(): ChromeVersion {
    const finder = ChromeVersionFinderFactory.create();
    return finder.findSync();
  }
}

class WindowsChromeVersionFinder implements IChromeVersionFinder {
  findSync(): ChromeVersion {
    const { error, stdout, stderr } = spawnSync('reg', ['query', 'HKEY_CURRENT_USER\\Software\\Google\\Chrome\\BLBeacon', '/v', 'version']);
    if (error) {
      throw error;
    }

    if (stderr.length > 0) {
      throw stderr;
    }

    const lines = stdout.toString().split(/\r?\n/);
    for (const line of lines) {
      const { success, version } = this.parse(line);
      if (success) {
        return version;
      }
    }

    throw new Error('Unable to find Chrome version');
  }

  parse(line: string): ChromeVersionParseResult {
    const lineMatch = /[ ]+version[ ]+REG_SZ[ ]+([0-9.]+)[ ]*/.exec(line);
    if (!lineMatch) {
      return { success: false, version: null };
    }

    const versionString = lineMatch[1];
    const versionMatch = /([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/.exec(versionString);
    if (!versionMatch) {
      return { success: false, version: null };
    }

    const major = Number(versionMatch[1]);
    const minor = Number(versionMatch[2]);
    const build = Number(versionMatch[3]);
    const patch = Number(versionMatch[4]);
    return { success: true, version: { versionString, major, minor, build, patch } };
  }
}

class MacChromeVersionFinder implements IChromeVersionFinder {
  findSync(): ChromeVersion {
    const { error, stdout, stderr } = spawnSync('defaults', ['read', '/Applications/Google Chrome.app/Contents/Info', 'CFBundleShortVersionString']);
    if (error) {
      throw error;
    }

    if (stderr.length > 0) {
      throw stderr;
    }

    const { success, version } = this.parse(stdout.toString());
    if (!success) {
      throw new Error('Unable to find Chrome version');
    }

    return version;
  }

  parse(line: string): ChromeVersionParseResult {
    const lineMatch = /([0-9.]+)/.exec(line);
    if (!lineMatch) {
      return { success: false, version: null };
    }

    const versionString = lineMatch[1];
    const versionMatch = /([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/.exec(versionString);
    if (!versionMatch) {
      return { success: false, version: null };
    }

    const major = Number(versionMatch[1]);
    const minor = Number(versionMatch[2]);
    const build = Number(versionMatch[3]);
    const patch = Number(versionMatch[4]);
    return { success: true, version: { versionString, major, minor, build, patch } };
  }
}

export class ChromeVersionFinderFactory {
  static create(): IChromeVersionFinder {
    if (process.platform === 'win32') {
      return new WindowsChromeVersionFinder();
    } else if (process.platform === 'darwin') {
      return new MacChromeVersionFinder();
    }

    throw new Error(`Unsupported platform: ${process.platform}`);
  }
}
