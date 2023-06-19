import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FeatureFileService, ListItem } from '../feature/file/feature-file.service';

@Injectable()
export class PublicFileService {
  constructor(private readonly featureFileService: FeatureFileService) {}

  async getApplicationList() {
    const applicationList: ListItem[] = [];

    let next: boolean | undefined = true;
    let continuationToken: string | undefined;
    while (next) {
      const list = await this.featureFileService.list({
        bucketKey: 'public',
        prefix: 'dost/',
        continuationToken: continuationToken,
      });

      continuationToken = list.continuationToken;
      next = list.isTruncated;

      if (list.contents) {
        applicationList.push(...list.contents);
      }
    }

    return applicationList;
  }

  async readMacYaml(): Promise<string> {
    const getResult = await this.featureFileService.get({
      bucketKey: 'public',
      key: 'dost/latest-mac.yml',
    });

    if (!getResult.body) {
      throw new HttpException('Mac yaml not found', HttpStatus.NOT_FOUND);
    }

    return getResult.body.toString('utf-8');
  }

  async readWindowsYaml(): Promise<string> {
    const getResult = await this.featureFileService.get({
      bucketKey: 'public',
      key: 'dost/latest.yml',
    });

    if (!getResult.body) {
      throw new HttpException('Windows yaml not found', HttpStatus.NOT_FOUND);
    }

    return getResult.body.toString('utf-8');
  }
}
