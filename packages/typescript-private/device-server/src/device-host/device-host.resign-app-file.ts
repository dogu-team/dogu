import { Milisecond, setAxiosErrorFilterToIntercepter } from '@dogu-tech/common';
import { ResignAppFileRequestBody, ResignAppFileResponseBodyData } from '@dogu-tech/device-client-common';
import { ChildProcess, HostPaths } from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import AsyncLock from 'async-lock';
import axios from 'axios';
import compressing from 'compressing';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
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
    const doguHome = HostPaths.doguHomePath;
    const configsPath = HostPaths.configsPath(doguHome);
    const certificateName = 'Apple Development: yow@dogutech.io (6KVR5VD4VM)';
    const provisioningProfilePath = HostPaths.resignProvisoningProfilePath(configsPath);

    if (!fs.existsSync(HostPaths.doguTempPath())) {
      await fs.promises.mkdir(HostPaths.doguTempPath(), { recursive: true });
    }

    const contents = await fs.promises.readFile(ResignShPath, { encoding: 'utf-8' });
    const shellPath = path.resolve(HostPaths.doguTempPath(), 'resign.sh');
    await fs.promises.writeFile(shellPath, contents, { encoding: 'utf-8' });

    const appPath = message.filePath;
    const tmpIpaPath = path.resolve(HostPaths.doguTempPath(), `resign-${uuidv4()}.zip`);
    const tmpUnzipPath = path.resolve(HostPaths.doguTempPath(), `resign-${uuidv4()}-ipadir`);
    const args = [appPath, `"${certificateName}"`, '-p', provisioningProfilePath, tmpIpaPath];

    await ChildProcess.spawnAndWait(shellPath, args, { shell: true, stdio: 'inherit' }, this.logger);
    await compressing.zip.uncompress(tmpIpaPath, tmpUnzipPath);
    await fs.promises.rm(appPath, { recursive: true, force: true });
    await fs.promises.cp(`${tmpUnzipPath}/Payload/${path.basename(appPath)}`, appPath, { recursive: true, force: true });
    return {};
  }
}
