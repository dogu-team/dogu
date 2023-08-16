import { ErrorResult, UpdateHostAppRequest } from '@dogu-private/console-host-agent';
import { Code } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import { getFilenameFromUrl, HostPaths, killProcessIgnore } from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import AdmZip, { IZipEntry } from 'adm-zip';
import child_process, { ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';
import { DeviceClientService } from '../device-client/device-client.service';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { UpdateMacTemplatePath } from '../res-map';
import { CommandProcessRegistry } from './command.process-registry';

@Injectable()
export class UpdateProcessor {
  constructor(private readonly commandProcessRegistry: CommandProcessRegistry, private readonly deviceClientService: DeviceClientService, private readonly logger: DoguLogger) {}

  async update(msg: UpdateHostAppRequest): Promise<ErrorResult> {
    try {
      // download app
      const filename = getFilenameFromUrl(msg.url);
      const downloadPath = path.resolve(HostPaths.doguTempPath(), filename);
      await this.deviceClientService.deviceHostClient.downloadSharedResource(downloadPath, msg.url, msg.fileSize, {});

      // detach shell
      const child = await this.detachShell(downloadPath);

      // quit app
      killProcessIgnore((env.DOGU_ROOT_PID as number) ?? process.pid, child.pid ? [child.pid] : [], this.logger);

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

  async detachShell(downloadPath: string): Promise<ChildProcess> {
    const dirname = path.dirname(downloadPath);
    const filename = path.basename(downloadPath);
    const entries = this.getZipEntries(downloadPath);
    if (entries.length === 0) {
      throw new Error('zip file is empty');
    }
    const appBundleName = entries[0].entryName.replace('/', '');
    const appName = appBundleName.replace('.app', '');

    const shPath = UpdateMacTemplatePath;
    let contents = await fs.promises.readFile(shPath, { encoding: 'utf-8' });
    contents = contents.replace('{{app_name}}', appName);
    contents = contents.replace('{{app_bundle}}', appBundleName);
    contents = contents.replace('{{zip_file}}', filename);

    const shellPath = path.resolve(HostPaths.doguTempPath(), 'update-mac.sh');
    if (fs.existsSync(shellPath)) {
      await fs.promises.unlink(shellPath);
    }
    await fs.promises.writeFile(shellPath, contents, { encoding: 'utf-8' });
    await fs.promises.chmod(shellPath, 0o755);
    const child = child_process.spawn('sh', [shellPath], { cwd: dirname, detached: true, stdio: 'ignore' });
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

  getZipEntries(filename: string): IZipEntry[] {
    const zip = new AdmZip(filename);
    return zip.getEntries();
  }
}
