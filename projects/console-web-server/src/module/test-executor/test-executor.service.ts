import { getDevicesByDisplay } from '@dogu-private/device-data';
import { BucketName, GCP } from '@dogu-private/sdk';
import { OrganizationId, UserId } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { TestExecutorWebResponsiveSnapshots } from '@dogu-private/console';
import { TestExecutorWebResponsive } from '../../db/entity/test-executor-web-responsive.entity';
import { TestExecutor } from '../../db/entity/test-executor.entity';
import { CreateWebResponsiveDto, GetWebResponsiveListDto } from './test-executor.dto';

@Injectable()
export class TestExecutorService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getWebResponsiveSnapshots(organizationId: OrganizationId, testExecutorId: string): Promise<TestExecutorWebResponsiveSnapshots> {
    const testExecutor = await this.dataSource.getRepository(TestExecutor).findOne({
      where: { organizationId: organizationId, testExecutorId },
      relations: ['webResponsives'],
    });

    if (testExecutor === null || testExecutor.webResponsives === undefined) {
      throw new Error('testExecutor is null or webResponsives is undefined');
    }

    const signedUrlByDisplay: TestExecutorWebResponsiveSnapshots = {};
    for (const webResponsive of testExecutor.webResponsives) {
      const urlWithoutProtocol = webResponsive.url.replace(/(^\w+:|^)\/\//, '');
      const prefixPath = `web-responsive/${organizationId}/${testExecutorId}/${urlWithoutProtocol}/`;
      const files = await GCP.getFiles(BucketName.TEST_EXECUTOR, prefixPath);

      const handleSignedUrls = files.map(async (file) => {
        const [signedUrl] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 60 * 1000,
        });

        const fileName = file.name.replace(prefixPath, '').replace('.jpeg', '');
        signedUrlByDisplay[fileName] = signedUrl;
      });

      await Promise.all(handleSignedUrls);
    }

    return signedUrlByDisplay;
  }

  async getWebResponsiveList(dto: GetWebResponsiveListDto): Promise<void> {
    const testExecutors = await this.dataSource.getRepository(TestExecutor).find({
      where: { organizationId: dto.organizationId, type: 'web-responsive' },
      relations: ['testExecutorWebResponsives'],
    });
  }

  async createWebResponsive(userId: UserId, dto: CreateWebResponsiveDto): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const urls = dto.urls.join(';');
      const vendors = dto.vendors.join(';');
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
          url: url,
        }),
      );
      await manager.getRepository(TestExecutorWebResponsive).save(webResponsives);

      const executionId = await GCP.runJob('test-executor-web-responsive', [dto.organizationId, testExecutor.testExecutorId, urls, vendors]);
      testExecutor.executionId = executionId;
      await manager.getRepository(TestExecutor).save(testExecutor);
    });
  }
}
