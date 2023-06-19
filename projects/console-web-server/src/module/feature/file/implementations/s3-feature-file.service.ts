import { Injectable } from '@nestjs/common';
import { env } from '../../../../env';
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
  constructor(private readonly logger: DoguLogger) {
    super('s3');
  }

  parseBucketKey(bucketKey: BucketKey): string {
    switch (bucketKey) {
      case 'organization':
        return env.DOGU_ORGANIZATION_BUCKET;
      case 'user':
        return env.DOGU_USER_BUCKET;
      case 'public':
        return env.DOGU_PUBLIC_BUCKET;
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
      continuationToken: output.ContinuationToken,
      isTruncated: output.IsTruncated,
    };
  }
}
