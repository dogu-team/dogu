import { getDevicesByDisplay } from '@dogu-private/device-data';
import { BucketName, GCP, JobName } from '@dogu-private/sdk';
import { UserId } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { TestExecutorBase, TestExecutorWebResponsiveSnapshotMap } from '@dogu-private/console';
import { TestExecutorWebResponsive } from '../../db/entity/test-executor-web-responsive.entity';
import { TestExecutor } from '../../db/entity/test-executor.entity';
import { CreateWebResponsiveDto, GetWebResponsiveListDto, GetWebResponsiveSnapshotsDto } from './test-executor.dto';

@Injectable()
export class TestExecutorService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getWebResponsiveList(dto: GetWebResponsiveListDto): Promise<TestExecutorBase[]> {
    const testExecutors = await this.dataSource.getRepository(TestExecutor).find({
      where: { organizationId: dto.organizationId, type: 'web-responsive' },
      relations: ['testExecutorWebResponsives'],
    });

    const testExecutorWithExecution: TestExecutorBase[] = [];
    const executions = await Promise.all(
      testExecutors.map(async (testExecutor) => GCP.getJobExecution('asia-northeast3', JobName.TEST_EXECUTOR_WEB_RESPONSIVE, testExecutor.executionId)),
    );

    for (const [index, testExecutor] of testExecutors.entries()) {
      testExecutorWithExecution.push({
        ...testExecutor,
        execution: executions[index],
      });
    }

    return testExecutorWithExecution;
  }

  async getWebResponsiveSnapshots(dto: GetWebResponsiveSnapshotsDto): Promise<TestExecutorWebResponsiveSnapshotMap> {
    const { organizationId, testExecutorId } = dto;

    const testExecutor = await this.dataSource.getRepository(TestExecutor).findOne({
      where: { organizationId: organizationId, testExecutorId },
      relations: ['testExecutorWebResponsives'],
    });

    if (testExecutor === null || testExecutor.testExecutorWebResponsives === undefined) {
      throw new Error('testExecutor is null or webResponsives is undefined');
    }

    const snapshots: TestExecutorWebResponsiveSnapshotMap = {};
    for (const webResponsive of testExecutor.testExecutorWebResponsives) {
      const urlWithoutProtocol = webResponsive.url.replace(/(^\w+:|^)\/\//, '');
      const prefixPath = `web-responsive/${organizationId}/${testExecutorId}/${urlWithoutProtocol}/`;
      const files = await GCP.getFiles(BucketName.TEST_EXECUTOR, prefixPath);

      const handleSignedUrls = files.map(async (file) => {
        const [signedUrl] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 60 * 1000,
        });

        if (snapshots[webResponsive.url] === undefined) {
          snapshots[webResponsive.url] = {
            vendors: webResponsive.vendors,
            images: {},
          };
        }

        if (snapshots[webResponsive.url] !== undefined) {
          const fileName = file.name.replace(prefixPath, '').replace('.jpeg', '');
          snapshots[webResponsive.url]['images'][fileName] = signedUrl;
        }
      });

      await Promise.all(handleSignedUrls);
    }

    return snapshots;
  }

  async createWebResponsiveSnapshots(userId: UserId, dto: CreateWebResponsiveDto): Promise<void> {
    if (dto.vendors === undefined || dto.vendors.length === 0) {
      throw new Error('vendors is empty');
    }

    await this.dataSource.transaction(async (manager) => {
      const urls = dto.urls.join('^');
      const vendors = dto.vendors.join('^');
      const snapshotCount = Object.keys(getDevicesByDisplay(dto.vendors)).length;

      const createdTestExecutor = manager.getRepository(TestExecutor).create({
        type: 'web-responsive',
        organizationId: dto.organizationId,
        creatorId: userId,
      });
      const testExecutor = await manager.getRepository(TestExecutor).save(createdTestExecutor);

      const webResponsives = dto.urls.map((url) =>
        manager.getRepository(TestExecutorWebResponsive).create({
          testExecutorId: testExecutor.testExecutorId,
          snapshotCount: snapshotCount,
          vendors: dto.vendors,
          url: url,
        }),
      );
      await manager.getRepository(TestExecutorWebResponsive).save(webResponsives);

      const executionId = await GCP.runJob(JobName.TEST_EXECUTOR_WEB_RESPONSIVE, [dto.organizationId, testExecutor.testExecutorId, urls, vendors]);
      testExecutor.executionId = executionId;
      await manager.getRepository(TestExecutor).save(testExecutor);
    });
  }
}
