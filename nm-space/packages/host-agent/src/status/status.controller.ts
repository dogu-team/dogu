import { Status, UpdateLatestVersionRequest } from '@dogu-private/dost-children';
import { Code, DownloadablePackageResult, platformArchitectureFromDownloadablePackageResult } from '@dogu-private/types';
import { DefaultHttpOptions, errorify, Instance } from '@dogu-tech/common';
import { processArchitecture, processPlatform } from '@dogu-tech/node';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ConsoleClientService } from '../console-client/console-client.service';
import { DoguLogger } from '../logger/logger';
import { UpdateProcessor } from '../processor/update.processor';
import { StatusService } from './status.service';

@Controller(Status.controller)
export class StatusController {
  constructor(
    private readonly statusService: StatusService,
    private readonly consoleClientService: ConsoleClientService,
    private readonly updateProcessor: UpdateProcessor,
    private readonly logger: DoguLogger,
  ) {}

  @Get(Status.getConnectionStatus.path)
  getConnectionStatus(): Instance<typeof Status.getConnectionStatus.responseBody> {
    return this.statusService.connectionStatus;
  }

  @Get(Status.getLatestVersion.path)
  async getLatestVersion(): Promise<Instance<typeof Status.getLatestVersion.responseBody>> {
    const res = await this.consoleClientService.client
      .get('/downloads/dogu-agent/latest', {
        timeout: DefaultHttpOptions.request.timeout,
      })
      .catch((error) => {
        this.logger.error('getLatestVersion failed', {
          error: errorify(error),
        });
        throw error;
      });
    const files = res.data as DownloadablePackageResult[];
    const hostPlatform = processPlatform();
    const hostArchitecture = processArchitecture();
    for (const file of files) {
      const { platform, architecture } = platformArchitectureFromDownloadablePackageResult(file);
      if (platform === hostPlatform && architecture === hostArchitecture) {
        return {
          version: file.version,
          url: file.url,
          fileSize: file.size,
        };
      }
    }
    throw new Error('No matching file found');
  }

  @Post(Status.updateLatestVersion.path)
  async updateLatestVersion(@Body() body: UpdateLatestVersionRequest): Promise<Instance<typeof Status.updateLatestVersion.responseBody>> {
    try {
      const err = await this.updateProcessor.update(body);
      return {
        isOk: err.value.code === Code.CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED ? true : false,
        reason: err.value.message,
      };
    } catch (e) {
      const error = errorify(e);
      return {
        isOk: false,
        reason: error.message,
      };
    }
  }
}
