import { Milisecond, setAxiosErrorFilterToIntercepter } from '@dogu-tech/common';
import { ResignAppFileRequestBody, ResignAppFileResponseBodyData } from '@dogu-tech/device-client-common';
import { ChildProcess, HostPaths } from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import AsyncLock from 'async-lock';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { ResignShPath } from '../res-map';

@Injectable()
export class DeviceHostResignAppFileService {
  private queueLock = new AsyncLock();
  private readonly client = axios.create();

  constructor(private readonly logger: DoguLogger) {
    setAxiosErrorFilterToIntercepter(this.client);
  }

  public async queueResign(message: ResignAppFileRequestBody): Promise<ResignAppFileResponseBodyData> {
    const result = await this.queueLock.acquire(
      message.filePath,
      async () => {
        return await this.resign(message);
      },
      {
        timeout: Milisecond.t15Minutes,
        maxOccupationTime: Milisecond.t15Minutes,
      },
    );
    if (result.result !== 'success') {
      this.logger.error('DeviceHostResignAppFileService.queueResign error', { result });
    }
    return result;
  }

  private async resign(message: ResignAppFileRequestBody): Promise<ResignAppFileResponseBodyData> {
    const appPath = message.filePath;
    const doguHome = HostPaths.doguHomePath;
    const configsPath = HostPaths.configsPath(doguHome);
    const identityName = env.APPLE_RESIGN_IDENTITY_NAME;
    const provisioningProfilePath = HostPaths.resignProvisoningProfilePath(configsPath);

    if (process.platform !== 'darwin') {
      return { result: 'not-macos' };
    }

    if (!appPath.endsWith('.ipa')) {
      return { result: 'not-ipa' };
    }

    if (0 == identityName.length) {
      return { result: 'no-identity-specified' };
    }
    if (!fs.existsSync(provisioningProfilePath)) {
      return { result: 'no-provisioning' };
    }

    if (!fs.existsSync(HostPaths.doguTempPath())) {
      await fs.promises.mkdir(HostPaths.doguTempPath(), { recursive: true });
    }

    const identityResult = await ChildProcess.execIgnoreError('security find-identity', {}, this.logger);
    if (!identityResult.stderr.includes(identityName) && identityResult.stderr.includes(identityName)) {
      return { result: 'no-identity-exists' };
    }

    const resignShellPath = path.resolve(HostPaths.doguTempPath(), `resign-${uuidv4()}.sh`);
    const resignedAppPath = path.resolve(HostPaths.doguTempPath(), `resign-${uuidv4()}.ipa`);

    if (!fs.existsSync(HostPaths.doguTempPath())) {
      await fs.promises.mkdir(HostPaths.doguTempPath(), { recursive: true });
    }
    try {
      await fs.promises.cp(ResignShPath, resignShellPath, { recursive: true, force: true });
      await fs.promises.chmod(resignShellPath, 0o755);

      const args = [resignShellPath, `"${appPath}"`, `"${identityName}"`, '-p', provisioningProfilePath, resignedAppPath].join(' ');

      this.logger.info('DeviceHostResignAppFileService.resign', { args });
      const result = await ChildProcess.exec(args, {}, this.logger);
      this.logger.info('DeviceHostResignAppFileService.resign done', { result });

      await fs.promises.rm(appPath, { recursive: true, force: true });
      await fs.promises.rename(resignedAppPath, appPath);
    } finally {
      await fs.promises.rm(resignShellPath, { recursive: true, force: true });
      await fs.promises.rm(resignedAppPath, { recursive: true, force: true });
    }
    return { result: 'success' };
  }
}
