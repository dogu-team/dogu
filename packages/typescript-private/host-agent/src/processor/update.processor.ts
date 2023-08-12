import { ErrorResult, UpdateAgent } from '@dogu-private/console-host-agent';
import { Code } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import { getFilenameFromUrl, HostPaths } from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import path from 'path';
import { DeviceClientService } from '../device-client/device-client.service';
import { DoguLogger } from '../logger/logger';
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
}
