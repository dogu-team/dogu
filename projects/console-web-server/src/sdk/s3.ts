import { OrganizationId, ProjectId, RoutineDeviceJobId, RoutineId, RoutinePipelineId } from '@dogu-private/types';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AWSError, Request, S3 as awsS3 } from 'aws-sdk';

import { env } from '../env';

const s3 = new awsS3({
  credentials: {
    accessKeyId: env.DOGU_AWS_KEY_ID,
    secretAccessKey: env.DOGU_AWS_ACCESS_KEY,
  },
  region: 'ap-northeast-2',
});

export module S3 {
  export function getObject(params: awsS3.GetObjectRequest): Request<awsS3.GetObjectOutput, AWSError> {
    const replacedKey = params.Key ? parseSpace(params.Key) : '';

    try {
      const file = s3.getObject({ ...params, Key: replacedKey });
      return file;
    } catch (e: any) {
      if ((e.code && e.code === 'NoSuchKey') || (e.statusCode && e.statusCode === 404)) {
        throw new HttpException(`File not found. FilePath: ${replacedKey}`, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(`Failed to get file. FilePath: ${replacedKey}`, HttpStatus.NOT_FOUND);
      }
    }
  }

  export async function getObjectAsync(params: awsS3.GetObjectRequest): Promise<awsS3.GetObjectOutput> {
    const replacedKey = params.Key ? parseSpace(params.Key) : '';

    try {
      const file = await s3.getObject({ ...params, Key: replacedKey }).promise();
      return file;
    } catch (e: any) {
      // e has 'NoSuchKey' and 'statusCode' when file is not exist
      if ((e.code && e.code === 'NoSuchKey') || (e.statusCode && e.statusCode === 404)) {
        throw new HttpException(`File not found. FilePath: ${replacedKey}`, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(`Failed to get file. FilePath: ${replacedKey}`, HttpStatus.NOT_FOUND);
      }
    }
  }

  export async function getHeadObjectAsync(params: awsS3.HeadObjectRequest): Promise<awsS3.HeadObjectOutput> {
    const replacedKey = params.Key ? parseSpace(params.Key) : '';
    try {
      const file = await s3.headObject({ ...params, Key: replacedKey }).promise();
      return file;
    } catch (e: any) {
      if ((e.code && e.code === 'NoSuchKey') || (e.statusCode && e.statusCode === 404)) {
        throw new HttpException(`File not found. FilePath: ${replacedKey}`, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(`Failed to get file. FilePath: ${replacedKey}`, HttpStatus.NOT_FOUND);
      }
    }
  }

  export async function uploadObjectAsync(params: awsS3.PutObjectRequest): Promise<awsS3.ManagedUpload.SendData> {
    const replacedKey = params.Key ? parseSpace(params.Key) : '';
    const file = await s3.upload({ ...params, Key: replacedKey }).promise();

    return file;
  }

  export async function putObjectAsync(params: awsS3.PutObjectRequest): Promise<awsS3.PutObjectOutput> {
    const replacedKey = params.Key ? parseSpace(params.Key) : '';
    const file = await s3.putObject({ ...params, Key: replacedKey }).promise();

    return file;
  }

  export async function deleteObjectAsync(params: awsS3.DeleteObjectRequest): Promise<awsS3.DeleteObjectOutput> {
    const replacedKey = params.Key ? parseSpace(params.Key) : '';
    const result = await s3.deleteObject({ ...params, Key: replacedKey }).promise();

    return result;
  }

  export async function listObjectsAsync(params: awsS3.ListObjectsV2Request): Promise<awsS3.ListObjectsV2Output> {
    const replacedPrefixKey = params.Prefix !== undefined ? parseSpace(params.Prefix) : undefined;
    const result = await s3.listObjectsV2({ ...params, Prefix: replacedPrefixKey }).promise();

    return result;
  }

  export async function getSignedUrl(params: any): Promise<string> {
    const url = await s3.getSignedUrlPromise('getObject', params);
    return url;
  }

  function parseSpace(space: string): string {
    return space.replace(/ /g, '_');
  }

  export function makeRoutineConfigFilePath(organizationId: OrganizationId, projectId: ProjectId, routineId: RoutineId, fileName: string, extension: string = 'yaml') {
    return `organizations/${organizationId}/projects/${projectId}/routines/${routineId}/config/${fileName}.${extension}`;
  }

  export function makeDeviceJobRecordFilePath(
    organizationId: OrganizationId,
    projectId: ProjectId,
    routineId: RoutineId,
    pipelineId: RoutinePipelineId,
    deviceJobId: RoutineDeviceJobId,
    fileName: string,
    extension: string | undefined,
  ): string {
    if (extension) {
      return `organizations/${organizationId}/projects/${projectId}/routines/${routineId}/pipelines/${pipelineId}/record/${deviceJobId}/${fileName}.${extension}`;
    } else {
      return `organizations/${organizationId}/projects/${projectId}/routines/${routineId}/pipelines/${pipelineId}/record/${deviceJobId}/${fileName}`;
    }
  }
}
