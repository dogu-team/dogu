import { PrefixLogger } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../logger/logger.instance';

const execAsync = promisify(exec);
const versionTimeout = 10_000;
const versionPattern = /^geckodriver\s(?<version>.+)\s\(.+\)\s*$/;

export class Geckodriver {
  private readonly logger = new PrefixLogger(logger, '[GeckoDriver]');

  getExecutablePath(): string {
    return HostPaths.external.browser.geckoDriverPath();
  }

  async getVersion(): Promise<string | undefined> {
    const driverPath = HostPaths.external.browser.geckoDriverPath();
    const { stdout } = await execAsync(`${driverPath} --version`, { encoding: 'utf8', timeout: versionTimeout });
    for (const line of stdout.split('\n')) {
      const match = line.match(versionPattern);
      if (match) {
        return match.groups?.version ?? undefined;
      }
    }
    return undefined;
  }
}
