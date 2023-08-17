import { DownloadablePackageResult, downloadPlatformsFromFilename, DOWNLOAD_PLATFORMS } from '@dogu-private/console';
import { compareSemverDesc, isMajorMinorMatch, parseSemver } from '@dogu-tech/common';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import yaml from 'js-yaml';
import path from 'path';
import { config } from '../../config';
import { env } from '../../env';
import { FEATURE_CONFIG } from '../../feature.config';
import { LatestYamlDownloadParseResult } from '../../types/download';
import { Page } from '../common/dto/pagination/page';
import { PageDto } from '../common/dto/pagination/page.dto';
import { PublicFileService } from '../file/public-file.service';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class DownloadService {
  constructor(private readonly publicFileService: PublicFileService, private readonly logger: DoguLogger) {}

  async getDoguAgentS3Latest(): Promise<DownloadablePackageResult[]> {
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

  async getDoguAgentS3LatestWithBeta(): Promise<DownloadablePackageResult[]> {
    const applications = await this.getDoguAgentS3PackageListSorted();

    const result: DownloadablePackageResult[] = [];
    for (const platform of Object.values(DOWNLOAD_PLATFORMS)) {
      const filtered = applications.filter((item) => item.platform === platform && isMajorMinorMatch(item.version, config.version));
      if (filtered.length > 0) {
        result.push(filtered[0]);
      }
    }

    return result;
  }

  async getDoguAgentS3PackageList(dto: PageDto): Promise<Page<DownloadablePackageResult>> {
    const { page, offset } = dto;

    // filter size, endsWith,
    const sorted = await this.getDoguAgentS3PackageListSorted();
    const sliced = sorted.slice((page - 1) * offset, page * offset);

    return new Page(page, offset, sorted.length, sliced);
  }

  async getDoguAgentS3PackageListSorted(): Promise<DownloadablePackageResult[]> {
    const applications = await this.publicFileService.getApplicationList();
    // filter size, endsWith,
    const filtered = applications.filter((item) => item.size && item.size > 0 && (item.key?.endsWith('dmg') || item.key?.endsWith('exe')));

    const packages: DownloadablePackageResult[] = [];
    for (const item of filtered) {
      if (!item.key) {
        this.logger.warn('DownloadService file key is undefined');
        continue;
      }
      const platform = downloadPlatformsFromFilename(item.key);
      const version = parseSemver(path.parse(item.key).name);

      packages.push({
        platform: platform,
        name: item.key.replace('dost/', ''),
        url: env.DOGU_DOST_DOWNLOAD_BASE_URL + item.key,
        releasedAt: item.lastModified?.toString() ?? '',
        version: version ?? version,
        size: item.size ?? 0,
      });
    }

    // sort by version, desc
    packages.sort((a, b) => {
      const versionCompare = compareSemverDesc(a.version, b.version);
      if (0 === versionCompare) {
        const adate = new Date(a.releasedAt);
        const bdate = new Date(b.releasedAt);
        return bdate.getTime() - adate.getTime();
      }
      return versionCompare;
    });

    return packages;
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

  async getDoguAgentPackageList(dto: PageDto): Promise<Page<DownloadablePackageResult>> {
    return FEATURE_CONFIG.get('doguAgentAppLocation') === 's3' ? await this.getDoguAgentS3PackageList(dto) : await this.getDoguAgentGithubPackageList(dto);
  }

  async getDoguAgentLatest(): Promise<DownloadablePackageResult[]> {
    return FEATURE_CONFIG.get('doguAgentAppLocation') === 's3' ? await this.getDoguAgentS3LatestWithBeta() : await this.getDoguAgentGithubLatest();
  }

  private async getDoguAgentGithubPackageList(dto: PageDto): Promise<Page<DownloadablePackageResult>> {
    const { page, offset } = dto;

    const applications = await this.getDoguAgentGithubPackagesSorted();
    const sliced = applications.slice((page - 1) * offset, page * offset);

    return new Page(page, offset, applications.length, sliced);
  }

  private async getDoguAgentGithubLatest(): Promise<DownloadablePackageResult[]> {
    const applications = await this.getDoguAgentGithubPackagesSorted();

    const result: DownloadablePackageResult[] = [];
    for (const platform of Object.values(DOWNLOAD_PLATFORMS)) {
      const filtered = applications.filter((item) => item.platform === platform && isMajorMinorMatch(item.version, config.version));
      if (filtered.length > 0) {
        result.push(filtered[0]);
      }
    }

    return result;
  }

  private async getDoguAgentGithubPackagesSorted(): Promise<DownloadablePackageResult[]> {
    const applications = await this.getDoguAgentGithubPackages();

    applications.sort((a, b) => compareSemverDesc(a.version, b.version));
    return applications;
  }

  private async getDoguAgentGithubPackages(): Promise<DownloadablePackageResult[]> {
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
        if (!asset.name.startsWith('dogu-agent')) {
          continue;
        }
        let platform = downloadPlatformsFromFilename(asset.name);
        const version = parseSemver(path.parse(asset.name).name);

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
