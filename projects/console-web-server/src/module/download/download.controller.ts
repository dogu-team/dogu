import { DownloadablePackageResult } from '@dogu-private/console';
import { Controller, Get, Query } from '@nestjs/common';
import { Page } from '../common/dto/pagination/page';
import { PageDto } from '../common/dto/pagination/page.dto';
import { DownloadService } from './download.service';

@Controller('/downloads')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Get('dost')
  async getDostAllPackages(@Query() dto: PageDto): Promise<Page<DownloadablePackageResult>> {
    const result = await this.downloadService.getDostPackageList(dto);
    return result;
  }

  @Get('dost/latest')
  async getDostLatestList(): Promise<DownloadablePackageResult[]> {
    return await this.downloadService.getDostLatest();
  }

  @Get('dogu-agent/self-hosted')
  async getDoguAgentSelfHostedAllPackages(@Query() dto: PageDto): Promise<Page<DownloadablePackageResult>> {
    const result = await this.downloadService.getDoguAgentSelfHostedPackageList(dto);
    return result;
  }

  @Get('dogu-agent/self-hosted/latest')
  async getDoguAgentSelfHostedLatest(): Promise<DownloadablePackageResult[]> {
    return await this.downloadService.getDoguAgentSelfHostedLatest();
  }
}
