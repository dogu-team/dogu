import { ErrorResult, UpdateAgent } from '@dogu-private/console-host-agent';
import { Code } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import { getFilenameFromUrl, HostPaths } from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import AdmZip, { IZipEntry } from 'adm-zip';
import child_process from 'child_process';
import fs from 'fs';
import path from 'path';
import { DeviceClientService } from '../device-client/device-client.service';
import { DoguLogger } from '../logger/logger';
import { UpdateMacTemplatePath } from '../res-map';
import { CommandProcessRegistry } from './command.process-registry';

@Injectable()
export class UpdateProcessor {
  constructor(private readonly commandProcessRegistry: CommandProcessRegistry, private readonly deviceClientService: DeviceClientService, private readonly logger: DoguLogger) {}

  async update(msg: UpdateAgent): Promise<ErrorResult> {
    try {
      // download app
      const filename = getFilenameFromUrl(msg.url);
      const downloadPath = path.resolve(HostPaths.doguTempPath(), filename);
      await this.deviceClientService.deviceHostClient.downloadSharedResource(downloadPath, msg.url, msg.fileSize, {});

      // detach shell

      // quit app

      return {
        kind: 'ErrorResult',
        value: {
          code: Code.CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED,
          message: '',
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

  async detachShell(downloadPath: string): Promise<void> {
    const dirname = path.dirname(downloadPath);
    const filename = path.basename(downloadPath);
    const entries = await this.getZipEntries(downloadPath);
    if (entries.length === 0) {
      throw new Error('zip file is empty');
    }
    const appBundleName = entries[0].entryName;
    const appName = appBundleName.replace('.app', '');

    const shPath = UpdateMacTemplatePath;
    const contents = await fs.promises.readFile(shPath, { encoding: 'utf-8' });
    contents.replace('{{app_name}}', appName);
    contents.replace('{{app_bundle}}', appBundleName);
    contents.replace('{{zip_file}}', filename);

    const shellPath = path.resolve(HostPaths.doguTempPath(), 'update-mac.sh');
    await fs.promises.writeFile(shellPath, contents, { encoding: 'utf-8' });
    await fs.promises.chmod(shellPath, 0o755);
    const child = child_process.spawn('sh', [shellPath], { cwd: dirname, detached: true, stdio: 'ignore' });
    child.unref();
  }

  async getZipEntries(filename: string): Promise<IZipEntry[]> {
    const zip = new AdmZip(filename);
    return zip.getEntries();
  }
}
