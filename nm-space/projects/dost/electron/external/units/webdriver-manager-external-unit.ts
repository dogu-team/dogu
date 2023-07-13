import { PrefixLogger, stringify } from '@dogu-tech/common';
import { HostPaths, newCleanNodeEnv } from '@dogu-tech/node';
import { exec, spawn } from 'child_process';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import util from 'util';
import { ExternalKey } from '../../../src/shares/external';
import { logger } from '../../log/logger.instance';
import { StdLogCallbackService } from '../../log/std-log-callback-service';
import { ThirdPartyPathMap } from '../../path-map';
import { ExternalUnitCallback, IExternalUnit } from '../external-unit';

const execAsync = util.promisify(exec);

function getEnv(): NodeJS.ProcessEnv {
  const env = newCleanNodeEnv();
  env.PATH = `${ThirdPartyPathMap.common.nodeBin}${path.delimiter}${env.PATH}`;
  return env;
}

export class WebdriverManagerExternalUnit extends IExternalUnit {
  private readonly logger = new PrefixLogger(logger, '[Webdriver Manager]');

  constructor(private readonly stdLogCallbackService: StdLogCallbackService, private readonly unitCallback: ExternalUnitCallback) {
    super();
  }

  isPlatformSupported(): boolean {
    return true;
  }

  isManualInstallNeeded(): boolean {
    return false;
  }

  getKey(): ExternalKey {
    return 'webdriver-manager';
  }

  getName(): string {
    return 'Webdriver Manager';
  }

  getEnvKeys(): string[] {
    return [];
  }

  async validateInternal(): Promise<void> {
    const webdriverManagerPath = HostPaths.external.nodePackage.webdriverManager.prototypePath();
    const webdriverManagerPathStat = await fs.promises.stat(webdriverManagerPath).catch(() => null);
    if (!webdriverManagerPathStat) {
      throw new Error('webdriver-manager not exist');
    }
    if (!webdriverManagerPathStat.isDirectory()) {
      throw new Error('webdriver-manager is not directory');
    }
    const packageJsonPath = path.resolve(webdriverManagerPath, 'package.json');
    const content = await fs.promises.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(content);
    if (!_.has(packageJson, 'dependencies.webdriver-manager')) {
      throw new Error('webdriver-manager is not installed');
    }
    const npxPath = ThirdPartyPathMap.common.npx;
    const env = getEnv();
    const { stdout, stderr } = await execAsync(`${npxPath} webdriver-manager version`, {
      cwd: webdriverManagerPath,
      env,
    });
    if (stdout.length > 0) {
      this.logger.info(stdout);
    }
    if (stderr.length > 0) {
      this.logger.warn(stderr);
    }
  }

  async install(): Promise<void> {
    this.unitCallback.onInstallStarted();
    const webdriverManagerPath = HostPaths.external.nodePackage.webdriverManager.prototypePath();
    const webdriverManagerPathStat = await fs.promises.stat(webdriverManagerPath).catch(() => null);
    if (webdriverManagerPathStat && webdriverManagerPathStat.isDirectory()) {
      await fs.promises.rm(webdriverManagerPath, { recursive: true, force: true });
    }
    await fs.promises.mkdir(webdriverManagerPath, { recursive: true });
    const npmPath = ThirdPartyPathMap.common.npm;
    const env = getEnv();
    const { stdout, stderr } = await execAsync(`${npmPath} init -y`, {
      cwd: webdriverManagerPath,
      env,
    });
    if (stdout.length > 0) {
      this.stdLogCallbackService.stdout(stdout);
    }
    if (stderr.length > 0) {
      this.stdLogCallbackService.stderr(stderr);
    }
    await new Promise<void>((resolve, reject) => {
      const child = spawn(npmPath, ['install', 'webdriver-manager'], {
        cwd: webdriverManagerPath,
        env,
      });
      const rejectOnError = (error: Error) => {
        reject(error);
      };
      child.on('error', rejectOnError);
      child.on('spawn', () => {
        child.off('error', rejectOnError);
        child.on('close', (code, signal) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`child process exited with code ${code} and signal ${signal}`));
          }
        });
      });
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (data) => {
        const message = stringify(data);
        if (!message) {
          return;
        }
        this.stdLogCallbackService.stdout(message);
        this.logger.info(message);
      });
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (data) => {
        const message = stringify(data);
        if (!message) {
          return;
        }
        this.stdLogCallbackService.stderr(message);
        this.logger.warn(message);
      });
    });
    this.unitCallback.onInstallCompleted();
  }

  cancelInstall(): void {
    this.logger.warn('cancelInstall not supported');
  }

  uninstall(): void {
    this.logger.warn('uninstall not supported');
  }

  isAgreementNeeded(): boolean {
    return false;
  }

  writeAgreement(): void {
    this.logger.warn('do not need agreement');
  }

  getTermUrl(): string | null {
    return null;
  }
}
