import { Injectable } from '@nestjs/common';
import { config } from '../../../../config';
import { S3 } from '../../../../sdk/s3';
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
export class S3FeatureFileService extends FeatureFileService {
  private readonly orgBucket: string;
  private readonly userBucket: string;
  private readonly publicBucket: string;

  constructor(private readonly logger: DoguLogger) {
    super('s3');
    if (config.fileService.s3.orgBucket === undefined) {
      throw new Error('config.fileService.s3.orgBucket is undefined');
    }

    if (config.fileService.s3.userBucket === undefined) {
      throw new Error('env.fileService.s3.userBucket is undefined');
    }

    if (config.fileService.s3.publicBucket === undefined) {
      throw new Error('env.fileService.s3.publicBucket is undefined');
    }

    this.orgBucket = config.fileService.s3.orgBucket;
    this.userBucket = config.fileService.s3.userBucket;
    this.publicBucket = config.fileService.s3.publicBucket;
  }

  parseBucketKey(bucketKey: BucketKey): string {
    switch (bucketKey) {
      case 'organization':
        return this.orgBucket;
      case 'user':
        return this.userBucket;
      case 'public':
        return this.publicBucket;
      default:
        throw new Error(`Invalid bucketKey: ${bucketKey}`);
    }
  }

  async put(options: PutOptions): Promise<PutResult> {
    const { body, bucketKey, key, contentType, acl } = options;
    const bucket = this.parseBucketKey(bucketKey);
    const object = await S3.uploadObjectAsync({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: acl,
    });
    return {
      location: object.Location,
    };
  }

  async get(options: GetOptions): Promise<GetResult> {
    const { bucketKey, key } = options;
    const bucket = this.parseBucketKey(bucketKey);
    const output = await S3.getObjectAsync({
      Bucket: bucket,
      Key: key,
    });
    return {
      body: output.Body?.toString(),
    };
  }

  async getSignedUrl(options: GetSignedUrlOptions): Promise<GetSignedUrlResult> {
    const { bucketKey, key, expires } = options;
    const bucket = this.parseBucketKey(bucketKey);
    const url = await S3.getSignedUrl({
      Bucket: bucket,
      Key: key,
      Expires: expires,
    });
    return {
      url,
    };
  }

  getReadableStream(options: GetReadableStreamOptions): GetReadableStreamResult {
    const { bucketKey, key, range } = options;
    const bucket = this.parseBucketKey(bucketKey);
    const request = S3.getObject({
      Bucket: bucket,
      Key: key,
      Range: range,
    });
    return {
      stream: request.createReadStream(),
    };
  }

  async head(options: HeadOptions): Promise<HeadResult> {
    const { bucketKey, key } = options;
    const bucket = this.parseBucketKey(bucketKey);
    const output = await S3.getHeadObjectAsync({
      Bucket: bucket,
      Key: key,
    });
    return {
      contentLength: output.ContentLength,
      contentType: output.ContentType,
    };
  }

  async delete(options: DeleteOptions): Promise<DeleteResult> {
    const { bucketKey, key } = options;
    const bucket = this.parseBucketKey(bucketKey);
    const output = await S3.deleteObjectAsync({
      Bucket: bucket,
      Key: key,
    });
    return {};
  }

  async list(options: ListOptions): Promise<ListResult> {
    const { bucketKey, prefix, continuationToken } = options;
    const bucket = this.parseBucketKey(bucketKey);
    const output = await S3.listObjectsAsync({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });
    const contents =
      output.Contents?.map((object) => ({
        key: object.Key,
        size: object.Size,
        lastModified: object.LastModified,
      })) ?? [];
    return {
      contents,
      continuationToken: output.NextContinuationToken,
      isTruncated: output.IsTruncated,
    };
  }
}
