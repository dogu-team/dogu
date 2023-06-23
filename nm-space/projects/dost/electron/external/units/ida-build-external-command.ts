import { PrefixLogger, stringify } from '@dogu-tech/common';
import { HostPaths, removeItemRecursive } from '@dogu-tech/node';
import { spawn } from 'child_process';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { ExternalKey } from '../../../src/shares/external';
import { logger } from '../../log/logger.instance';
import { StdLogCallbackService } from '../../log/std-log-callback-service';
import { copyiOSDeviceAgentProject } from '../../settings/ios-device-agent-project';
import { IExternalUnit } from '../external-unit';
import { validateXcode } from '../xcode';

export class IdaBuildExternalUnit extends IExternalUnit {
  private readonly logger = new PrefixLogger(logger, '[IosDeviceAgentBuild]');

  constructor(private readonly stdLogCallbackService: StdLogCallbackService) {
    super();
  }

  isPlatformSupported(): boolean {
    return process.platform === 'darwin';
  }

  isManualInstallNeeded(): boolean {
    return true;
  }

  getKey(): ExternalKey {
    return 'ios-device-agent-build';
  }

  getName(): string {
    return 'iOSDeviceAgent';
  }

  getEnvKeys(): string[] {
    return [];
  }

  async validateInternal(): Promise<void> {
    await validateXcode(this.stdLogCallbackService);
    const idaProductsPath = path.resolve(HostPaths.external.xcodeProject.idaDerivedDataPath(), 'Build/Products');
    const idaExePaths = [
      path.resolve(idaProductsPath, 'Debug-iphoneos/DoguRunner-Runner.app/DoguRunner-Runner'),
      path.resolve(idaProductsPath, 'Debug-iphoneos/DoguDev.app/DoguDev'),
    ];
    for (const idaExePath of idaExePaths) {
      if (!fs.existsSync(idaExePath)) {
        throw Error(`iOSDeviceAgent executable not found. path: ${idaExePath}`);
      }
      const stat = await fsPromises.stat(idaExePath);
      if (stat.size === 0) {
        throw Error(`iOSDeviceAgent executable is empty. path: ${idaExePath}`);
      }
    }
    const xctestrunFile = (await fsPromises.readdir(idaProductsPath)).find((file) => file.endsWith('.xctestrun'));
    if (!xctestrunFile) {
      throw Error(`xctestrun file not found. path: ${idaProductsPath}`);
    }
    const xctestrunPath = path.resolve(idaProductsPath, xctestrunFile);
    const xctestrunStat = await fsPromises.stat(xctestrunPath);
    if (xctestrunStat.size === 0) {
      throw Error(`xctestrun file is empty. path: ${xctestrunPath}`);
    }
  }

  async install(): Promise<void> {
    await copyiOSDeviceAgentProject(logger);
    const idaDerivedDataPath = HostPaths.external.xcodeProject.idaDerivedDataPath();
    const idaProjectPath = path.resolve(HostPaths.external.xcodeProject.idaProjectDirectoryPath(), 'IOSDeviceAgent.xcodeproj');
    if (!fs.existsSync(idaProjectPath)) {
      throw Error(`iOSDeviceAgent project not found. path: ${idaProjectPath}`);
    }
    await new Promise<void>((resolve, reject) => {
      const child = spawn('xcodebuild', [
        'build-for-testing',
        '-project',
        idaProjectPath,
        '-scheme',
        'DoguRunner',
        '-destination',
        'generic/platform=iOS',
        '-derivedDataPath',
        idaDerivedDataPath,
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
          (async () => {
            this.stdLogCallbackService.stdout(`${this.getName()} is closed. code: ${code} signal: ${signal}`);

            const remainDirs = [
              { parent: idaDerivedDataPath, dir: ['Build', 'Logs'] },
              { parent: path.resolve(idaDerivedDataPath, 'Build'), dir: ['Products'] },
            ];

            for (const remainDir of remainDirs) {
              const dirs = await fsPromises.readdir(remainDir.parent);
              for (const dir of dirs) {
                if (remainDir.dir.indexOf(dir) === -1) {
                  await removeItemRecursive(path.resolve(remainDir.parent, dir));
                }
              }
            }

            const buildProductsSubDir = path.resolve(idaDerivedDataPath, 'Build/Products/Debug-iphoneos');
            const allowedExtensions = ['.app'];
            const files = await fsPromises.readdir(buildProductsSubDir);
            for (const file of files) {
              if (!allowedExtensions.some((ext) => file.endsWith(ext))) {
                await removeItemRecursive(`${buildProductsSubDir}/${file}`);
              }
            }
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`${this.getName()} failed. code: ${code} signal: ${signal}`));
            }
          })().catch((error) => {
            this.logger.error(error);
            reject(error);
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
    });
  }

  isAgreementNeeded(): boolean {
    return false;
  }

  writeAgreement(): void {
    this.logger.warn('do not need agreement');
  }

  cancelInstall(): void {
    this.logger.warn('cancel install not supported');
  }

  uninstall(): void {
    this.logger.warn('uninstall not supported');
  }

  getTermUrl(): string | null {
    return null;
  }
}
