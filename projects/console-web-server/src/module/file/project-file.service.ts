import { OrganizationId, ProjectId, RoutineDeviceJobId, RoutineId, RoutinePipelineId } from '@dogu-private/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import path from 'path';
import { FeatureConfig } from '../../feature.config';
import { FeatureFileService, HeadResult, ListItem } from '../feature/file/feature-file.service';
import { ProjectAppDirectory, ProjectAppType } from './project-app-file';

@Injectable()
export class ProjectFileService {
  constructor(private readonly featureFileService: FeatureFileService) {}

  private makeRoutinePath(organizationId: OrganizationId, projectId: ProjectId, routineId: RoutineId, fileName: string) {
    return `organizations/${organizationId}/projects/${projectId}/routines/${routineId}/config/${fileName}.yaml`;
  }

  async readRoutine(organizationId: OrganizationId, projectId: ProjectId, routineId: RoutineId, routineName: string) {
    const routinePath = this.makeRoutinePath(organizationId, projectId, routineId, routineName);
    const getResult = await this.featureFileService.get({
      bucketKey: 'organization',
      key: routinePath,
    });

    if (!getResult.body) {
      throw new NotFoundException(`Routine ${routineName} not found`);
    }

    const routineData = getResult.body.toString();
    return routineData;
  }

  async uploadRoutine(file: Express.Multer.File, organizationId: OrganizationId, projectId: ProjectId, routineId: RoutineId, routineName: string): Promise<string> {
    if (file.mimetype !== 'text/yaml') {
      throw new Error(`Invalid file type: ${file.mimetype}`);
    }

    const routinePath = this.makeRoutinePath(organizationId, projectId, routineId, routineName);
    const putResult = await this.featureFileService.put({
      bucketKey: 'organization',
      key: routinePath,
      body: file.buffer.toString(),
      contentType: file.mimetype,
    });
    return putResult.location;
  }

  private makeDeviceJobRecordPath(
    organizationId: OrganizationId,
    projectId: ProjectId,
    routineId: RoutineId,
    pipelineId: RoutinePipelineId,
    deviceJobId: RoutineDeviceJobId,
    extension: string,
  ) {
    return `organizations/${organizationId}/projects/${projectId}/routines/${routineId}/pipelines/${pipelineId}/records/${deviceJobId}/record.${extension}`;
  }

  private async anyDeviceJobRecords(
    organizationId: OrganizationId,
    projectId: ProjectId,
    routineId: RoutineId,
    pipelineId: RoutinePipelineId,
    deviceJobId: RoutineDeviceJobId,
    extensions: string[],
  ) {
    const directoryPath =
      FeatureConfig.get('fileService') === 's3'
        ? `organizations/${organizationId}/projects/${projectId}/routines/${routineId}/pipelines/${pipelineId}/records/${deviceJobId}`
        : `/organizations/${organizationId}/projects/${projectId}/routines/${routineId}/pipelines/${pipelineId}/records/${deviceJobId}`;

    const recordList: ListItem[] = [];

    let next: boolean | undefined = true;
    let continuationToken: string | undefined;

    while (next) {
      const list = await this.featureFileService.list({
        bucketKey: 'organization',
        prefix: directoryPath,
        continuationToken: continuationToken,
      });

      continuationToken = list.continuationToken;
      next = list.isTruncated;

      if (list.contents && list.contents.length > 0) {
        const filteredList = list.contents.filter((item) => {
          if (!item.key) {
            return false;
          }
          const extension = path.extname(item.key).toLowerCase().replace('.', '');
          return extensions.includes(extension);
        });

        recordList.push(...filteredList);
      }
    }
    if (recordList.length === 0) {
      throw new NotFoundException(`Device job record not found`);
    }

    if (!recordList[0].key) {
      throw new NotFoundException(`Device job record key not found`);
    }
    return recordList[0].key;
  }

  async uploadDeviceJobRecord(
    file: Express.Multer.File,
    organizationId: OrganizationId,
    projectId: ProjectId,
    routineId: RoutineId,
    pipelineId: RoutinePipelineId,
    deviceJobId: RoutineDeviceJobId,
  ) {
    const recordExtension = path.extname(file.originalname).toLowerCase().replace('.', '');
    const recordPath = this.makeDeviceJobRecordPath(organizationId, projectId, routineId, pipelineId, deviceJobId, recordExtension);

    const putResult = await this.featureFileService.put({
      bucketKey: 'organization',
      key: recordPath,
      body: file.buffer,
      contentType: file.mimetype,
    });
    return putResult.location;
  }

  async getDeviceJobRecordUrl(organizationId: OrganizationId, projectId: ProjectId, routineId: RoutineId, pipelineId: RoutinePipelineId, deviceJobId: RoutineDeviceJobId) {
    const recordPath = await this.anyDeviceJobRecords(organizationId, projectId, routineId, pipelineId, deviceJobId, ['webm', 'mp4']);
    const getSignedUrlResult = await this.featureFileService.getSignedUrl({
      bucketKey: 'organization',
      key: recordPath,
      expires: 60 * 60 * 1,
    });
    return getSignedUrlResult.url;
  }

  async getDeviceJobRecordStream(
    organizationId: OrganizationId,
    projectId: ProjectId,
    routineId: RoutineId,
    pipelineId: RoutinePipelineId,
    deviceJobId: RoutineDeviceJobId,
    options?: { start: number; end: number },
  ) {
    const recordPath = await this.anyDeviceJobRecords(organizationId, projectId, routineId, pipelineId, deviceJobId, ['webm', 'mp4']);
    const getReadableStreamResult = await this.featureFileService.getReadableStream({
      bucketKey: 'organization',
      key: recordPath,
      range: options ? `bytes=${options.start}-${options.end}` : undefined,
    });
    return getReadableStreamResult.stream;
  }

  async getDeviceJobRecordMeta(
    organizationId: OrganizationId,
    projectId: ProjectId,
    routineId: RoutineId,
    pipelineId: RoutinePipelineId,
    deviceJobId: RoutineDeviceJobId,
  ): Promise<HeadResult> {
    const recordPath = await this.anyDeviceJobRecords(organizationId, projectId, routineId, pipelineId, deviceJobId, ['webm', 'mp4']);
    const headResult = await this.featureFileService.head({
      bucketKey: 'organization',
      key: recordPath,
    });
    return headResult;
  }

  getAppDirectory(organizationId: OrganizationId, projectId: ProjectId, type: ProjectAppType) {
    return new ProjectAppDirectory(organizationId, projectId, type, this.featureFileService);
  }
}
