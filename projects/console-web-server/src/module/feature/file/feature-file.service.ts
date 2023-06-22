import { PromiseOrValue } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';

export const BucketKey = ['user', 'organization', 'public'] as const;
export type BucketKey = (typeof BucketKey)[number];

export interface BaseOptions {
  /**
   * @description
   * s3: parse to `S3.BucketName`
   * nexus: parse to nexus `repository`
   */
  bucketKey: BucketKey;

  /**
   * @description
   * s3: `S3.Object.Key`
   * nexus: Component `/assets/0/path`
   */
  key: string;
}

export interface PutOptions extends BaseOptions {
  /**
   * @description
   * s3: `S3.PutObjectRequest.Body`
   * nexus: axios `request.data`
   */
  body: string | Buffer;

  /**
   * @description
   * s3: `S3.PutObjectRequest.ContentType`
   * nexus: not support
   */
  contentType?: string;

  /**
   * @description
   * s3: `S3.PutObjectRequest.ACL`
   * nexus: not support
   */
  acl?: string;
}

export interface PutResult {
  /**
   * @description
   * s3: `ManagedUpload.SendData.Location`
   * nexus: uploaded url
   */
  location: string;
}

export interface GetOptions extends BaseOptions {}

export interface GetResult {
  /**
   * @description
   * s3: `S3.GetObjectOutput.Body`
   * nexus: axios `response.data`
   */
  body?: string | Buffer;
}

export interface GetSignedUrlOptions extends BaseOptions {
  /**
   * @description
   * s3: `S3.GetSignedUrlRequest.Expires`
   * nexus: not support
   */
  expires?: number;
}

export interface GetSignedUrlResult {
  url: string;
}

export interface GetReadableStreamOptions extends BaseOptions {
  /**
   * @description
   * s3: `S3.GetObjectRequest.Range`
   * nexus: `Range` header
   */
  range?: string;
}

export interface GetReadableStreamResult {
  stream: NodeJS.ReadableStream;
}

export interface HeadOptions extends BaseOptions {}

export interface HeadResult {
  /**
   * @description
   * s3: `S3.HeadObjectOutput.ContentLength`
   * nexus: axios `response.headers['content-length']`
   */
  contentLength?: number;

  /**
   * @description
   * s3: `S3.HeadObjectOutput.ContentType`
   * nexus: axios `response.headers['content-type']`
   */
  contentType?: string;
}

export interface DeleteOptions extends BaseOptions {}

export interface DeleteResult {}

export interface ListOptions {
  /**
   * @description
   * s3: parse to `S3.BucketName`
   * nexus: parse to nexus `repository`
   */
  bucketKey: BucketKey;

  /**
   * @description
   * s3: `S3.ListObjectsV2Request.Prefix`
   * nexus: filter to `/items/{index}/assets/0/path`
   */
  prefix?: string;

  /**
   * @description
   * s3: `S3.ListObjectsV2Request.ContinuationToken`
   * nexus: axios `response.data.continuationToken`
   */
  continuationToken?: string;
}

export interface ListItem {
  /**
   * @description
   * s3: `S3.Object.Key`
   * nexus: Component `/assets/0/path`
   */
  key?: string;

  /**
   * @description
   * s3: `S3.Object.Size`
   * nexus: Component `/assets/0/fileSize`
   */
  size?: number;

  /**
   * @description
   * s3: `S3.Object.LastModified`
   * nexus: Component `/assets/0/lastModified`
   */
  lastModified?: Date;
}

export interface ListResult {
  /**
   * @description
   * s3: `S3.ListObjectsV2Output.Contents`
   * nexus: axios `response.data.items`
   */
  contents?: ListItem[];

  /**
   * @description
   * s3: `S3.ListObjectsV2Output.IsTruncated`
   * nexus: axios `response.data.continuationToken === null`
   */
  isTruncated?: boolean;

  /**
   * @description
   * s3: `S3.ListObjectsV2Output.ContinuationToken`
   * nexus: axios `response.data.continuationToken`
   */
  continuationToken?: string;
}

@Injectable()
export abstract class FeatureFileService {
  constructor(protected readonly key: 'nexus') {}

  /**
   * @description
   * s3: parse to S3.BucketName
   * nexus: parse to nexus "repository"
   */
  abstract parseBucketKey(bucketKey: BucketKey): string;

  /**
   * @description
   * s3: `upload`
   * nexus: `put`
   */
  abstract put(options: PutOptions): Promise<PutResult>;

  /**
   * @description
   * s3: `getObject`
   * nexus: `get`
   */
  abstract get(options: GetOptions): Promise<GetResult>;

  /**
   * @description
   * s3: `headObject`
   * nexus: `head`
   */
  abstract head(options: HeadOptions): Promise<HeadResult>;

  /**
   * @description
   * s3: `deleteObject`
   * nexus: `delete`
   */
  abstract delete(options: DeleteOptions): Promise<DeleteResult>;

  /**
   * @description
   * s3: `listObjectsV2`
   * nexus: `filter items`
   */
  abstract list(options: ListOptions): Promise<ListResult>;

  /**
   * @description
   * s3: `getObject.createReadStream`
   * nexus: `get response stream`
   */
  abstract getReadableStream(options: GetReadableStreamOptions): PromiseOrValue<GetReadableStreamResult>;

  /**
   * @description
   * s3: `getSignedUrlPromise`
   * nexus: `return original url`
   */
  abstract getSignedUrl(options: GetSignedUrlOptions): PromiseOrValue<GetSignedUrlResult>;
}
