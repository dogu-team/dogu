import { Injectable } from '@nestjs/common';
import axios from 'axios';
import lodash from 'lodash';
import { config } from '../../../../config';
import { DoguLogger } from '../../../logger/logger';
import {
  BucketKey,
  DeleteOptions,
  DeleteResult,
  FeatureFileService,
  GetOptions,
  GetReadableStreamOptions,
  GetReadableStreamResult,
  GetResult,
  GetSignedUrlOptions,
  GetSignedUrlResult,
  HeadOptions,
  HeadResult,
  ListOptions,
  ListResult,
  PutOptions,
  PutResult,
} from '../feature-file.service';

@Injectable()
export class NexusFeatureFileService extends FeatureFileService {
  private readonly url = config.fileService.nexus.url;
  private readonly userName = config.fileService.nexus.username;
  private readonly password = config.fileService.nexus.password;

  constructor(private readonly logger: DoguLogger) {
    super('nexus');
  }

  private createBasicCredentials(): { username: string; password: string } {
    return {
      username: this.userName,
      password: this.password,
    };
  }

  parseBucketKey(bucketKey: BucketKey): string {
    return bucketKey;
  }

  async put(options: PutOptions): Promise<PutResult> {
    const { bucketKey, key, body } = options;
    const repository = this.parseBucketKey(bucketKey);
    const url = `${this.url}/repository/${repository}/${key}`;
    const response = await axios
      .put(url, body, {
        auth: this.createBasicCredentials(),
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      })
      .catch((error) => {
        this.logger.error(error);
        throw error;
      });
    return {
      location: url,
    };
  }

  async get(options: GetOptions): Promise<GetResult> {
    const { bucketKey, key } = options;
    const repository = this.parseBucketKey(bucketKey);
    const url = `${this.url}/repository/${repository}/${key}`;
    const response = await axios.get(url, {
      auth: this.createBasicCredentials(),
    });
    return {
      body: response.data,
    };
  }

  async head(options: HeadOptions): Promise<HeadResult> {
    const { bucketKey, key } = options;
    const repository = this.parseBucketKey(bucketKey);
    const url = `${this.url}/repository/${repository}/${key}`;
    const response = await axios.head(url, {
      auth: this.createBasicCredentials(),
    });
    return {
      contentType: response.headers['content-type'],
      contentLength: response.headers['content-length'],
    };
  }

  async delete(options: DeleteOptions): Promise<DeleteResult> {
    const { bucketKey, key } = options;
    const repository = this.parseBucketKey(bucketKey);
    const url = `${this.url}/repository/${repository}/${key}`;
    const response = await axios.delete(url, {
      auth: this.createBasicCredentials(),
    });
    return {};
  }

  async list(options: ListOptions): Promise<ListResult> {
    const { bucketKey, prefix, continuationToken } = options;
    const repository = this.parseBucketKey(bucketKey);
    const url = `${this.url}/service/rest/v1/search?repository=${repository}&group=${prefix}${continuationToken ? `&continuationToken=${continuationToken}` : ''}`;

    const response = await axios.get(url, {
      auth: this.createBasicCredentials(),
    });

    if (!lodash.has(response.data, 'items') || !lodash.has(response.data, 'continuationToken')) {
      throw new Error('Invalid response');
    }
    const items = response.data.items as any[];
    const newContinuationToken = response.data.continuationToken as string | null;

    if (!Array.isArray(items)) {
      throw new Error('Invalid response');
    }
    const contents = items.map((item) => {
      const path = lodash.get(item, 'assets[0].path') as string;
      const fileSize = lodash.get(item, 'assets[0].fileSize') as number;
      const lastModified = lodash.get(item, 'assets[0].lastModified') as string;
      if (typeof path !== 'string' || typeof fileSize !== 'number' || typeof lastModified !== 'string') {
        throw new Error('Invalid response');
      }
      return {
        key: path,
        size: fileSize,
        lastModified: new Date(lastModified),
      };
    });

    return {
      contents,
      continuationToken: typeof newContinuationToken === 'string' ? newContinuationToken : undefined,
      isTruncated: newContinuationToken ? true : false,
    };
  }

  async getReadableStream(options: GetReadableStreamOptions): Promise<GetReadableStreamResult> {
    const { bucketKey, key, range } = options;
    const repository = this.parseBucketKey(bucketKey);
    const url = `${this.url}/repository/${repository}/${key}`;
    const response = await axios.get(url, {
      responseType: 'stream',
      auth: this.createBasicCredentials(),
      headers: {
        Range: range,
      },
    });
    const stream = response.data;
    return {
      stream,
    };
  }

  getSignedUrl(options: GetSignedUrlOptions): GetSignedUrlResult {
    const { bucketKey, key } = options;
    const repository = this.parseBucketKey(bucketKey);
    const url = `${this.url}/repository/${repository}/${key}`;
    return {
      url,
    };
  }
}
