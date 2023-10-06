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
    return result;
  }

  private async resign(message: ResignAppFileRequestBody): Promise<ResignAppFileResponseBodyData> {
    const appPath = message.filePath;
    const doguHome = HostPaths.doguHomePath;
    const configsPath = HostPaths.configsPath(doguHome);
    const identityName = env.APPLE_RESIGN_IDENTITY_NAME;
    const provisioningProfilePath = HostPaths.resignProvisoningProfilePath(configsPath);

    if (!appPath.endsWith('.ipa')) {
      return { result: 'not-ipa' };
    }

    if (0 == identityName.length) {
      return { result: 'no-identity' };
    }
    if (!fs.existsSync(provisioningProfilePath)) {
      return { result: 'no-provisioning' };
    }

    if (!fs.existsSync(HostPaths.doguTempPath())) {
      await fs.promises.mkdir(HostPaths.doguTempPath(), { recursive: true });
    }

    const contents = await fs.promises.readFile(ResignShPath, { encoding: 'utf-8' });
    const shellPath = path.resolve(HostPaths.doguTempPath(), `resign-${uuidv4()}.sh`);
    await fs.promises.writeFile(shellPath, contents, { encoding: 'utf-8' });
    await fs.promises.chmod(shellPath, 0o755);

    const resignedAppPath = path.resolve(HostPaths.doguTempPath(), `resign-${uuidv4()}.ipa`);
    const args = [shellPath, appPath, `"${identityName}"`, '-p', provisioningProfilePath, resignedAppPath].join(' ');

    this.logger.info('DeviceHostResignAppFileService.resign', { args });
    const result = await ChildProcess.exec(args, {}, this.logger);
    this.logger.info('DeviceHostResignAppFileService.resign done', { result });
    await fs.promises.rm(appPath, { recursive: true, force: true });
    await fs.promises.cp(resignedAppPath, appPath, { recursive: true, force: true });

    await fs.promises.rm(shellPath, { recursive: true, force: true });
    await fs.promises.rm(resignedAppPath, { recursive: true, force: true });
    return { result: 'success' };
  }
}
