import { ErrorResult } from '@dogu-private/console-host-agent';
import { Code } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import { getChildProcessIds, getFilenameFromUrl, HostPaths, killProcessIgnore } from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import AsyncLock from 'async-lock';
import child_process, { ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';
import { DeviceClientService } from '../device-client/device-client.service';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { UpdateMacTemplatePath, UpdateWindowsTemplatePath } from '../res-map';
import { CommandProcessRegistry } from './command.process-registry';

@Injectable()
export class UpdateProcessor {
  private lock = new AsyncLock({ timeout: 5000 });

  constructor(
    private readonly commandProcessRegistry: CommandProcessRegistry,
    private readonly deviceClientService: DeviceClientService,
    private readonly logger: DoguLogger,
  ) {}

  async update(msg: { url: string; fileSize: number }): Promise<ErrorResult> {
    try {
      if (this.lock.isBusy('update')) {
        throw new Error('already updating');
      }
      await this.lock
        .acquire('update', async () => {
          // detach shell
          const filename = getFilenameFromUrl(msg.url);
          const downloadPath = path.resolve(HostPaths.doguTempPath(), filename);
          if (!fs.existsSync(HostPaths.doguTempPath())) {
            await fs.promises.mkdir(HostPaths.doguTempPath(), { recursive: true });
          }

          this.logger.info(`UpdateProcessor.update. detach shell ${downloadPath}`);
          const updateShChild = await this.detachShell(msg.url, msg.fileSize, downloadPath);

          // quit app
          setTimeout(() => {
            (async (): Promise<void> => {
              const pid = env.DOGU_ROOT_PID ?? process.pid;
              this.logger.info(`UpdateProcessor.update. quit app pid: ${pid}`);
              const pids = child.pid ? [...(await getChildProcessIds(child.pid, this.logger)), child.pid] : [];
              killProcessIgnore(pid, pids, this.logger);
            })().catch((e) => {
              const error = errorify(e);
              this.logger.error(`UpdateProcessor.update. quit app error: ${error.message}`);
            });
          }, 2000);
        })
        .catch((e) => {
          const error = errorify(e);
          this.logger.error(`UpdateProcessor.update. error: ${error.message}`);
        });

      return {
        kind: 'ErrorResult',
        value: {
          code: Code.CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED,
          message: 'ok',
          details: {
            stack: '',
            cause: '',
          },
        },
      };
    } catch (e) {
      const error = errorify(e);
      return Promise.resolve({
        kind: 'ErrorResult',
        value: {
          code: Code.CODE_UNEXPECTED_ERROR,
          message: error.message,
          details: {
            stack: error.stack,
            cause: error.cause,
          },
        },
      });
    }
  }

  private async detachShell(url: string, fileSize: number, downloadPath: string): Promise<ChildProcess> {
    if (process.platform === 'darwin') {
      return this.detachShellMacos(url, fileSize, downloadPath);
    }
    if (process.platform === 'win32') {
      return this.detachShellWindows(url, fileSize, downloadPath);
    }
    throw new Error(`Update failed. not supported platform ${process.platform}`);
  }

  private async detachShellMacos(url: string, fileSize: number, downloadPath: string): Promise<ChildProcess> {
    const dirname = path.dirname(downloadPath);
    const filename = path.basename(downloadPath);
    if (!downloadPath.endsWith('.zip')) {
      throw new Error('Update failed. not zip file');
    }

    const shPath = UpdateMacTemplatePath;
    let contents = await fs.promises.readFile(shPath, { encoding: 'utf-8' });
    contents = contents.replaceAll('{{work_dir}}', dirname);
    contents = contents.replaceAll('{{file_url}}', url);
    contents = contents.replaceAll('{{dir_name}}', filename.replace('.zip', ''));
    contents = contents.replaceAll('{{file_size}}', fileSize.toString());

    const shellPath = path.resolve(HostPaths.doguTempPath(), 'update-mac.sh');
    if (fs.existsSync(shellPath)) {
      await fs.promises.unlink(shellPath);
    }
    await fs.promises.writeFile(shellPath, contents, { encoding: 'utf-8' });
    await fs.promises.chmod(shellPath, 0o755);
    const child = child_process.spawn('/System/Applications/Utilities/Terminal.app/Contents/MacOS/Terminal', [shellPath], { cwd: dirname, detached: true, stdio: 'ignore' });
    child.unref();
    const onSpawnPromise = new Promise<void>((resolve, reject) => {
      child.on('spawn', () => {
        resolve();
      });
      child.on('error', (err) => {
        reject(err);
      });
    });
    await onSpawnPromise;
    return child;
  }

  private async detachShellWindows(url: string, fileSize: number, downloadPath: string): Promise<ChildProcess> {
    const dirname = path.dirname(downloadPath);
    const filename = path.basename(downloadPath);
    if (!downloadPath.endsWith('.exe')) {
      throw new Error('Update failed. not exe file');
    }

    const shPath = UpdateWindowsTemplatePath;
    let contents = await fs.promises.readFile(shPath, { encoding: 'utf-8' });
    contents = contents.replaceAll('{{work_dir}}', dirname);
    contents = contents.replaceAll('{{file_url}}', url);
    contents = contents.replaceAll('{{file_size}}', fileSize.toString());
    contents = contents.replaceAll('{{installer}}', filename);

    const shellPath = path.resolve(HostPaths.doguTempPath(), 'update-windows.cmd');
    if (fs.existsSync(shellPath)) {
      await fs.promises.unlink(shellPath);
    }
    await fs.promises.writeFile(shellPath, contents, { encoding: 'utf-8' });
    await fs.promises.chmod(shellPath, 0o755);
    const child = child_process.spawn(shellPath, { cwd: dirname, detached: true, stdio: 'ignore' });
    child.unref();
    const onSpawnPromise = new Promise<void>((resolve, reject) => {
      child.on('spawn', () => {
        resolve();
      });
      child.on('error', (err) => {
        reject(err);
      });
    });
    await onSpawnPromise;
    return child;
  }
}
