import { PrefixLogger } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../logger/logger.instance';

const execAsync = promisify(exec);
const versionTimeout = 10_000;

/**
 * @example Included with Safari 16.5.2 (18615.2.9.11.10)
 */
const versionPattern = /^Included with Safari\s(?<version>.+)\s\(.+\)\s*$/;

export class Safaridriver {
  private readonly logger = new PrefixLogger(logger, `[${this.constructor.name}]`);

  getExecutablePath(): string {
    return HostPaths.external.browser.safaridriverPath();
  }

  async getVersion(): Promise<string | undefined> {
    const driverPath = HostPaths.external.browser.safaridriverPath();
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
