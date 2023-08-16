import { DownloadablePackageResult, DOWNLOAD_PLATFORMS } from '@dogu-private/console';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { Octokit } from '@octokit/rest';
import yaml from 'js-yaml';
import { env } from '../../env';
import { LatestYamlDownloadParseResult } from '../../types/download';
import { Page } from '../common/dto/pagination/page';
import { PageDto } from '../common/dto/pagination/page.dto';
import { PublicFileService } from '../file/public-file.service';

@Injectable()
export class DownloadService {
  constructor(private readonly publicFileService: PublicFileService) {}

  async getDostLatest(): Promise<DownloadablePackageResult[]> {
    const { mac, windows } = await this.parseLatestYaml();

    const macFiles = mac.files.filter((item) => item.url.endsWith('dmg'));

    const macResult: DownloadablePackageResult[] = macFiles.map((item) => ({
      platform: item.url.includes('arm64') ? DOWNLOAD_PLATFORMS.APPLE_ARM64 : DOWNLOAD_PLATFORMS.APPLE_X86,
      releasedAt: mac.releaseDate,
      url: env.DOGU_DOST_DOWNLOAD_BASE_URL + 'dost/' + item.url,
      name: item.url,
      version: mac.version,
      size: item.size,
    }));

    const winResult: DownloadablePackageResult = {
      platform: DOWNLOAD_PLATFORMS.WINDOWS,
      name: windows.files[0].url,
      releasedAt: windows.releaseDate,
      url: env.DOGU_DOST_DOWNLOAD_BASE_URL + 'dost/' + windows.files[0].url,
      version: windows.version,
      size: windows.files[0].size,
    };

    const response: DownloadablePackageResult[] = [...macResult, winResult];
    return response;
  }

  async getDostPackageList(dto: PageDto): Promise<Page<DownloadablePackageResult>> {
    const { page, offset } = dto;

    const applications = await this.publicFileService.getApplicationList();
    // filter size, endsWith,
    const filtered = applications.filter((item) => item.size && item.size > 0 && (item.key?.endsWith('dmg') || item.key?.endsWith('exe')));

    // sort by version, desc
    filtered.sort((a, b) => {
      const av: RegExpMatchArray | null | undefined = a.key?.match(/[0-9]*\.[0-9]*\.[0-9]*/);
      const bv: RegExpMatchArray | null | undefined = b.key?.match(/[0-9]*\.[0-9]*\.[0-9]*/);

      if (av && bv) {
        const arr: string[] = av[0].split('.');
        const brr: string[] = bv[0].split('.');

        const len = Math.min(arr.length, brr.length);

        for (let i = 0; i < len; i++) {
          const a2 = +arr[i] || 0;
          const b2 = +brr[i] || 0;

          if (a2 !== b2) {
            return a2 > b2 ? -1 : 1;
          }
        }

        return arr.length - brr.length;
      }

      return -1;
    });

    const sliced = filtered.slice((page - 1) * offset, page * offset);
    const mapped: DownloadablePackageResult[] = sliced.map((item) => ({
      platform: DOWNLOAD_PLATFORMS.UNDEFINED,
      name: item.key?.replace('dost/', '') ?? 'Unknown',
      url: env.DOGU_DOST_DOWNLOAD_BASE_URL + item.key,
      releasedAt: item.lastModified?.toString() ?? '',
      version: '',
      size: item.size ?? 0,
    }));

    return new Page(page, offset, filtered.length, mapped);
  }

  // private async getAllS3Objects(param: ListObjectsV2Request): Promise<Object[]> {
  //   let continueToken: string | undefined;
  //   let shouldRequest: boolean | undefined = true;
  //   let objects: Object[] = [];

  //   ({ Bucket: 'appupdate.dev.dogutech.io', Prefix: 'dost/' });

  //   while (shouldRequest) {
  //     try {
  //       const result = await S3.listObjectsAsync({ ...param, ContinuationToken: continueToken });
  //       continueToken = result.ContinuationToken;
  //       shouldRequest = result.IsTruncated;
  //       if (result.Contents) {
  //         objects = concat(objects, result.Contents);
  //         objects = objects.concat(result.Contents);
  //       }
  //     } catch (e) {
  //       Logger.error('AWS s3 pagination error', e);
  //       throw new BadRequestException('Failed to get list');
  //     }
  //   }

  //   return objects;
  // }

  async getDoguAgentSelfHostedPackageList(dto: PageDto): Promise<Page<DownloadablePackageResult>> {
    const { page, offset } = dto;

    const applications = await this.getDoguAgentSelfHostedPackagesSorted();
    const sliced = applications.slice((page - 1) * offset, page * offset);

    return new Page(page, offset, applications.length, sliced);
  }

  async getDoguAgentSelfHostedLatest(): Promise<DownloadablePackageResult[]> {
    const applications = await this.getDoguAgentSelfHostedPackagesSorted();
    // loop DOWNLOAD_PLATFORMS and get latest version
    const result: DownloadablePackageResult[] = [];
    for (const platform of Object.values(DOWNLOAD_PLATFORMS)) {
      const filtered = applications.filter((item) => item.platform === platform);
      if (filtered.length > 0) {
        result.push(filtered[0]);
      }
    }

    return result;
  }

  async getDoguAgentSelfHostedPackagesSorted(): Promise<DownloadablePackageResult[]> {
    const applications = await this.getDoguAgentSelfHostedPackages();

    applications.sort((a, b) => {
      const av: RegExpMatchArray | null | undefined = a.name?.match(/[0-9]*\.[0-9]*\.[0-9]*/);
      const bv: RegExpMatchArray | null | undefined = b.name?.match(/[0-9]*\.[0-9]*\.[0-9]*/);

      if (av && bv) {
        const arr: string[] = av[0].split('.');
        const brr: string[] = bv[0].split('.');

        const len = Math.min(arr.length, brr.length);

        for (let i = 0; i < len; i++) {
          const a2 = +arr[i] || 0;
          const b2 = +brr[i] || 0;

          if (a2 !== b2) {
            return a2 > b2 ? -1 : 1;
          }
        }

        return arr.length - brr.length;
      }

      return -1;
    });
    return applications;
  }

  async getDoguAgentSelfHostedPackages(): Promise<DownloadablePackageResult[]> {
    // list all release that has dogu-agent asset at https://github.com/dogu-team/dogu/releases
    const octokit = new Octokit();
    const response = await octokit.repos.listReleases({
      owner: 'dogu-team',
      repo: 'dogu',
    });
    const releases = response.data.filter((item) => item.assets.length > 0);
    const result: DownloadablePackageResult[] = [];
    for (const release of releases) {
      for (const asset of release.assets) {
        if (!asset.name.startsWith('dogu-agent-self-hosted')) {
          continue;
        }
        let platform = DOWNLOAD_PLATFORMS.UNDEFINED;
        if (asset.name.includes('mac-arm64')) {
          platform = DOWNLOAD_PLATFORMS.APPLE_ARM64;
        } else if (asset.name.includes('mac-x64')) {
          platform = DOWNLOAD_PLATFORMS.APPLE_X86;
        } else if (asset.name.includes('win-x64')) {
          platform = DOWNLOAD_PLATFORMS.WINDOWS;
        }

        let version = release.tag_name.replace('v', '').split('-')[0];
        const match: RegExpMatchArray | null | undefined = asset.name.match(/[0-9]*\.[0-9]*\.[0-9]*/);
        if (match) {
          version = match[0];
        }

        result.push({
          platform: platform,
          name: asset.name,
          url: asset.browser_download_url,
          releasedAt: release.published_at ?? '',
          version: version ?? version,
          size: asset.size,
        });
      }
    }

    return result;
  }

  private async parseLatestYaml(): Promise<{ mac: LatestYamlDownloadParseResult; windows: LatestYamlDownloadParseResult }> {
    try {
      const macYaml = await this.publicFileService.readMacYaml();
      const windowYaml = await this.publicFileService.readWindowsYaml();

      const mac = yaml.load(macYaml) as LatestYamlDownloadParseResult;
      const windows = yaml.load(windowYaml) as LatestYamlDownloadParseResult;

      return { mac, windows };

      throw new NotFoundException('Latest information is not matched');
    } catch (e) {
      Logger.error('Latest file not found', e);
      throw new NotFoundException('Latest file not found');
    }
  }
}
