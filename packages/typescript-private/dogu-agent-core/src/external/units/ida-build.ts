import { PrefixLogger, Printable, stringify } from '@dogu-tech/common';
import { HostPaths, killChildProcess } from '@dogu-tech/node';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { checkProjectEqual, copyiOSDeviceAgentProject, removeiOSDeviceAgent, validateiOSDeviceAgentProjectExist } from '../../settings/ios-device-agent-project';
import { ExternalKey } from '../types';
import { IExternalUnit } from '../unit';
import { validateXcode } from '../xcode';

export class IdaBuildExternalUnit extends IExternalUnit {
  private readonly logger: PrefixLogger;
  private child: ChildProcessWithoutNullStreams | null = null;
  private failCount = 0;

  constructor(logger: Printable) {
    super();
    this.logger = new PrefixLogger(logger, '[iOSDeviceAgent Build]');
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
    await validateXcode(this.logger);
    const isEqual = await checkProjectEqual(this.logger);
    if (!isEqual) {
      throw Error('iOSDeviceAgent project is not equal. It could be an outdated version of the iOSDeviceAgnet project. Please build again after cleaning.');
    }
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
    this.logger.info(`Start ${this.getName()} `);
    if (this.child) {
      this.logger.info(`${this.getName()} is already running. kill it.`);
      await killChildProcess(this.child);
      this.child = null;
    }
    if (!(await validateiOSDeviceAgentProjectExist(this.logger))) {
      this.logger.info(`${this.getName()} copy project start.`);
      await copyiOSDeviceAgentProject(this.logger);
      this.logger.info(`${this.getName()} copy project done.`);
    }
    this.logger.info(`${this.getName()} copy project done.`);
    const idaDerivedDataPath = HostPaths.external.xcodeProject.idaDerivedDataPath();
    const idaProjectPath = path.resolve(HostPaths.external.xcodeProject.idaProjectDirectoryPath(), 'IOSDeviceAgent.xcodeproj');
    if (!fs.existsSync(idaProjectPath)) {
      throw Error(`iOSDeviceAgent project not found. path: ${idaProjectPath}`);
    }
    await new Promise<void>((resolve, reject) => {
      this.child = spawn('xcodebuild', [
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

      const onErrorForReject = (error: Error): void => {
        reject(error);
      };
      this.child.on('error', onErrorForReject);
      this.child.on('spawn', () => {
        this.child?.off('error', onErrorForReject);
        this.child?.on('error', (error) => {
          this.logger.error(stringify(error));
        });
        this.logger.info(`${this.getName()} spawned`);
        this.child?.on('close', (code, signal) => {
          (async (): Promise<void> => {
            const msg = `${this.getName()} is closed. code: ${stringify(code)} signal: ${stringify(signal)}`;
            this.logger.info(msg);
            this.child = null;

            if (code === 0) {
              const remainDirs = [
                { parent: idaDerivedDataPath, dir: ['Build', 'Logs'] },
                { parent: path.resolve(idaDerivedDataPath, 'Build'), dir: ['Products'] },
              ];

              for (const remainDir of remainDirs) {
                const dirs = await fsPromises.readdir(remainDir.parent);
                for (const dir of dirs) {
                  if (remainDir.dir.indexOf(dir) === -1) {
                    await fs.promises.rm(path.resolve(remainDir.parent, dir), { force: true, recursive: true });
                  }
                }
              }

              const buildProductsSubDir = path.resolve(idaDerivedDataPath, 'Build/Products/Debug-iphoneos');
              const allowedExtensions = ['.app'];
              const files = await fsPromises.readdir(buildProductsSubDir);
              for (const file of files) {
                if (!allowedExtensions.some((ext) => file.endsWith(ext))) {
                  await fs.promises.rm(`${buildProductsSubDir}/${file}`, { force: true, recursive: true });
                }
              }
              resolve();
            } else {
              this.failCount += 1;
              reject(new Error(`${this.getName()} failed. code: ${stringify(code)} signal: ${stringify(signal)}`));
            }
          })().catch((error) => {
            this.logger.error(error);
            reject(error);
          });
        });
        this.child?.stdout.setEncoding('utf8');
        this.child?.stdout.on('data', (data) => {
          const message = stringify(data);
          if (!message) {
            return;
          }
          this.logger.info(message);
        });
        this.child?.stderr.setEncoding('utf8');
        this.child?.stderr.on('data', (data) => {
          const message = stringify(data);
          if (!message) {
            return;
          }
          this.logger.error(message);
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

  async uninstall(): Promise<void> {
    await removeiOSDeviceAgent(this.logger);
  }

  getTermUrl(): string | null {
    return null;
  }
}
