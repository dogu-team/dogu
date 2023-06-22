import { PrefixLogger, stringify } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import { spawn } from 'child_process';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { ExternalCommandKey } from '../../../src/shares/external';
import { logger } from '../../log/logger.instance';
import { StdLogCallbackService } from '../../log/std-log-callback-service';
import { IExternalCommand } from '../external-command';
import { validateXcode } from '../xcode';

export class WdaBuildExternalCommand extends IExternalCommand {
  private readonly logger = new PrefixLogger(logger, '[WebDriverAgentBuild]');

  constructor(private readonly stdLogCallbackService: StdLogCallbackService) {
    super();
  }

  isPlatformSupported(): boolean {
    return process.platform === 'darwin';
  }

  getKey(): ExternalCommandKey {
    return 'web-driver-agent-build';
  }

  getName(): string {
    return 'WebDriverAgentBuild';
  }

  getEnvKeys(): string[] {
    return [];
  }

  async validateInternal(): Promise<void> {
    await validateXcode(this.stdLogCallbackService);
    const wdaProductsPath = path.resolve(HostPaths.external.xcodeProject.wdaDerivedDataPath(), 'Build/Products');
    const webDriverAgentExePath = path.resolve(wdaProductsPath, 'Debug-iphoneos/WebDriverAgentRunner-Runner.app/WebDriverAgentRunner-Runner');
    if (!fs.existsSync(webDriverAgentExePath)) {
      throw Error(`WebDriverAgentRunner-Runner not found. path: ${webDriverAgentExePath}`);
    }
    const stat = await fsPromises.stat(webDriverAgentExePath);
    if (stat.size === 0) {
      throw Error(`WebDriverAgentRunner-Runner is empty. path: ${webDriverAgentExePath}`);
    }
    const xctestrunFile = (await fsPromises.readdir(wdaProductsPath)).find((file) => file.endsWith('.xctestrun'));
    if (!xctestrunFile) {
      throw Error(`xctestrun file not found. path: ${wdaProductsPath}`);
    }
    const xctestrunPath = path.resolve(wdaProductsPath, xctestrunFile);
    const xctestrunStat = await fsPromises.stat(xctestrunPath);
    if (xctestrunStat.size === 0) {
      throw Error(`xctestrun file is empty. path: ${xctestrunPath}`);
    }
  }

  async run(): Promise<void> {
    const wdaDerivedDataPath = HostPaths.external.xcodeProject.wdaDerivedDataPath();
    const wdaProjectPath = path.resolve(HostPaths.external.xcodeProject.wdaProjectDirectoryPath(), 'WebDriverAgent.xcodeproj');
    await new Promise<void>((resolve, reject) => {
      const child = spawn('xcodebuild', [
        'build-for-testing',
        '-project',
        wdaProjectPath,
        '-scheme',
        'WebDriverAgentRunner',
        '-destination',
        'generic/platform=iOS',
        '-derivedDataPath',
        wdaDerivedDataPath,
      ]);

      const onErrorForReject = (error: Error) => {
        reject(error);
      };
      child.on('error', onErrorForReject);
      child.on('spawn', () => {
        child.off('error', onErrorForReject);
        child.on('error', (error) => {
          this.stdLogCallbackService.stderr(stringify(error));
        });
        this.stdLogCallbackService.stdout(`Start ${this.getName()}...`);
        child.on('close', (code, signal) => {
          this.stdLogCallbackService.stdout(`${this.getName()} completed. code: ${code} signal: ${signal}`);
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`${this.getName()} failed. code: ${code} signal: ${signal}`));
          }
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
    });
  }

  cancel(): void {}
}
