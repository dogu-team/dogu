import {
  RecordTestCaseBase,
  RecordTestCasePropCamel,
  RecordTestCasePropSnake,
  RecordTestCaseResponse,
  RecordTestScenarioAndRecordTestCasePropCamel,
  RecordTestStepResponse,
} from '@dogu-private/console';
import { OrganizationId, Platform, ProjectId, RecordTestCaseId } from '@dogu-private/types';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import { Device, RecordTestScenarioAndRecordTestCase } from '../../../../db/entity/index';
import { RecordTestCase } from '../../../../db/entity/record-test-case.entity';
import { EMPTY_PAGE, Page } from '../../../../module/common/dto/pagination/page';
import { ProjectFileService } from '../../../../module/file/project-file.service';
import { ApplicationService } from '../../../../module/project/application/application.service';
import { AppiumIsKeyboardShownRemoteWebDriverBatchRequestItem } from '../../../../module/remote/remote-webdriver/remote-webdriver.appium-batch-request-items';
import { RemoteWebDriverBatchRequestExecutor } from '../../../../module/remote/remote-webdriver/remote-webdriver.batch-request-executor';
import { RemoteWebDriverService } from '../../../../module/remote/remote-webdriver/remote-webdriver.service';
import { DeleteSessionRemoteWebDriverBatchRequestItem } from '../../../../module/remote/remote-webdriver/remote-webdriver.w3c-batch-request-items';
import { detachRecordTestCaseFromScenario, makeActionBatchExcutor, newWebDriverSession } from '../common';
import { CreateRecordTestCaseDto, FindRecordTestCaseByProjectIdDto, NewSessionRecordTestCaseDto, UpdateRecordTestCaseDto } from '../dto/record-test-case.dto';
import { RecordTestStepService } from '../record-test-step/record-test-step.service';

@Injectable()
export class RecordTestCaseService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(RemoteWebDriverService)
    private readonly remoteWebDriverService: RemoteWebDriverService,
    @Inject(ApplicationService)
    private readonly applicationService: ApplicationService,
    @Inject(RecordTestStepService)
    private readonly recordTestStepService: RecordTestStepService,
    @Inject(ProjectFileService)
    private readonly projectFileService: ProjectFileService,
  ) {}

  async findRecordTestCasesByProjectId(projectId: ProjectId, dto: FindRecordTestCaseByProjectIdDto): Promise<Page<RecordTestCaseBase>> {
    const rv = await this.dataSource
      .getRepository(RecordTestCase) //
      .createQueryBuilder('recordTestCase')
      .where(`recordTestCase.${RecordTestCasePropSnake.project_id} = :${RecordTestCasePropCamel.projectId}`, { projectId })
      .andWhere(`recordTestCase.${RecordTestCasePropSnake.name} ILIKE :${RecordTestCasePropCamel.name}`, { name: `%${dto.keyword}%` })
      .orderBy(`recordTestCase.${RecordTestCasePropCamel.updatedAt}`, 'DESC')
      .limit(dto.getDBLimit())
      .offset(dto.getDBOffset())
      .getManyAndCount();

    const data = rv[0];
    const totalCount = rv[1];

    if (data.length === 0) {
      return EMPTY_PAGE;
    }

    const page = new Page<RecordTestCaseBase>(dto.page, dto.offset, totalCount, data);
    return page;
  }

  async getKeyboardShown(organizationId: OrganizationId, projectId: ProjectId, recordTestCaseId: string): Promise<boolean> {
    const recordTestCase = await this.dataSource
      .getRepository(RecordTestCase) //
      .createQueryBuilder('recordTestCase')
      .leftJoinAndSelect(`recordTestCase.${RecordTestCasePropCamel.recordTestSteps}`, `recordTestStep`)
      .where(`recordTestCase.${RecordTestCasePropSnake.project_id} = :${RecordTestCasePropCamel.projectId}`, { projectId })
      .andWhere(`recordTestCase.${RecordTestCasePropSnake.record_test_case_id} = :recordTestCaseId`, { recordTestCaseId })
      .getOne();

    if (!recordTestCase) {
      throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }
    const activeDeviceId = recordTestCase.activeDeviceId;
    if (!activeDeviceId) {
      throw new HttpException(`Device does not have activeDeviceId. RecordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }

    const device = await this.dataSource.getRepository(Device).findOne({ where: { organizationId, deviceId: activeDeviceId } });
    if (!device) {
      throw new HttpException(`Device not found. deviceSerial: ${recordTestCase.activeDeviceId}`, HttpStatus.NOT_FOUND);
    }

    const batchExecutor: RemoteWebDriverBatchRequestExecutor = makeActionBatchExcutor(
      this.remoteWebDriverService,
      projectId,
      recordTestCase.activeSessionId!,
      recordTestCase.activeSessionKey!,
      device,
    );
    const appiumIsKeyboardShown = new AppiumIsKeyboardShownRemoteWebDriverBatchRequestItem(batchExecutor, recordTestCase.activeSessionId!);
    await batchExecutor.execute();
    const isKeyboardShown = await appiumIsKeyboardShown.response();
    return isKeyboardShown;
  }

  async findRecordTestCaseById(organizationId: OrganizationId, projectId: ProjectId, recordTestCaseId: string): Promise<RecordTestCaseResponse> {
    const recordTestCase = await this.dataSource
      .getRepository(RecordTestCase) //
      .createQueryBuilder('recordTestCase')
      .leftJoinAndSelect(`recordTestCase.${RecordTestCasePropCamel.recordTestSteps}`, `recordTestStep`)
      .where(`recordTestCase.${RecordTestCasePropSnake.project_id} = :${RecordTestCasePropCamel.projectId}`, { projectId })
      .andWhere(`recordTestCase.${RecordTestCasePropSnake.record_test_case_id} = :recordTestCaseId`, { recordTestCaseId })
      .getOne();

    if (!recordTestCase) {
      throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }

    const recordTestSteps = recordTestCase.recordTestSteps ?? [];
    const stepPromises = recordTestSteps.map(async (step) => {
      const screenshotUrl = this.projectFileService.getRecordTestScreenshotUrl(organizationId, projectId, recordTestCaseId, step.recordTestStepId);
      const pageSourceUrl = this.projectFileService.getRecordTestPageSourceUrl(organizationId, projectId, recordTestCaseId, step.recordTestStepId);

      return Promise.all([screenshotUrl, pageSourceUrl]).then(([resolvedScreenshotUrl, resolvedPageSourceUrl]) => ({
        ...step,
        screenshotUrl: resolvedScreenshotUrl,
        pageSourceUrl: resolvedPageSourceUrl,
      }));
    });
    const stepResponses: RecordTestStepResponse[] = await Promise.all(stepPromises);

    const rv: RecordTestCaseResponse = {
      ...recordTestCase,
      recordTestSteps: stepResponses,
    };
    return rv;
  }

  async createRecordTestCase(organizationId: OrganizationId, projectId: ProjectId, dto: CreateRecordTestCaseDto): Promise<RecordTestCaseBase> {
    const { name, browserName, packageName } = dto;
    if (!packageName && !browserName) {
      throw new HttpException(`packageName or browserName is required`, HttpStatus.BAD_REQUEST);
    } else if (packageName && browserName) {
      throw new HttpException(`packageName and browserName is exclusive`, HttpStatus.BAD_REQUEST);
    }
    const testCase = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, name } });
    if (testCase) {
      throw new HttpException(`RecordTestCase name is duplicated. name: ${name}`, HttpStatus.BAD_REQUEST);
    }
    const newData = this.dataSource.getRepository(RecordTestCase).create({
      recordTestCaseId: v4(),
      projectId,
      name,
      platform: Platform.PLATFORM_UNSPECIFIED,
      activeDeviceId: null,
      activeDeviceScreenSizeX: null,
      activeDeviceScreenSizeY: null,
      activeSessionId: null,
      activeSessionKey: null,
      packageName,
      browserName,
    });

    const recordTestCase = await this.dataSource.getRepository(RecordTestCase).save(newData);
    return recordTestCase;
  }

  async updateRecordTestCase(projectId: ProjectId, recordTestCaseId: RecordTestCaseId, dto: UpdateRecordTestCaseDto): Promise<RecordTestCaseBase> {
    const { name } = dto;
    const testCase = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId } });
    if (!testCase) {
      throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }

    const isDuplicated = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, name } });
    if (isDuplicated) {
      throw new HttpException(`RecordTestCase name is duplicated. name: ${name}`, HttpStatus.BAD_REQUEST);
    }

    testCase.name = name;
    await this.dataSource.getRepository(RecordTestCase).save(testCase);

    return testCase;
  }

  async softRemoveRecordTestCase(manager: EntityManager, projectId: ProjectId, recordTestCaseId: RecordTestCaseId): Promise<void> {
    const testCase = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId }, relations: [RecordTestCasePropCamel.recordTestSteps] });
    if (!testCase) {
      throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }

    // steps
    const recordTestSteps = testCase.recordTestSteps ?? [];
    for (const step of recordTestSteps) {
      await this.recordTestStepService.softDeleteRecordTestStep(manager, projectId, recordTestCaseId, step.recordTestStepId);
    }

    // case & scenario mapping
    const mappingDatas =
      (await manager
        .getRepository(RecordTestScenarioAndRecordTestCase)
        .find({ where: { recordTestCaseId }, relations: [RecordTestScenarioAndRecordTestCasePropCamel.recordTestScenario] })) ?? [];

    for (const mappingData of mappingDatas) {
      const recordTestScenario = mappingData.recordTestScenario!;
      await detachRecordTestCaseFromScenario(manager, recordTestScenario, testCase);
    }

    await manager.getRepository(RecordTestCase).softDelete(testCase.recordTestCaseId);
  }

  public async newSession(manager: EntityManager, projectId: ProjectId, recordTestCaseId: RecordTestCaseId, dto: NewSessionRecordTestCaseDto): Promise<RecordTestCaseBase> {
    const { deviceId } = dto;
    const device = await manager.getRepository(Device).findOne({ where: { deviceId } });
    if (!device) {
      throw new HttpException(`Device not found. deviceId: ${deviceId}`, HttpStatus.NOT_FOUND);
    }
    const testCase = await manager.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId } });
    if (!testCase) {
      throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }
    const { browserName, packageName } = testCase;

    const newSessionResponse = await newWebDriverSession(
      manager,
      this.applicationService,
      this.remoteWebDriverService,
      device,
      projectId,
      recordTestCaseId,
      browserName,
      packageName,
    );
    const res = await newSessionResponse.response();
    const capabilities = res.value.capabilities as Record<string, unknown>;
    const deviceScreenSize = capabilities['deviceScreenSize'] as string;

    testCase.activeDeviceScreenSizeX = Number(deviceScreenSize.split('x')[0]);
    testCase.activeDeviceScreenSizeY = Number(deviceScreenSize.split('x')[1]);
    testCase.activeSessionId = res.value.sessionId;
    testCase.activeSessionKey = recordTestCaseId;
    testCase.activeDeviceId = device.deviceId;
    await manager.getRepository(RecordTestCase).save(testCase);

    return testCase;
  }

  async deleteSession(organizationId: OrganizationId, projectId: ProjectId, recordTestCaseId: RecordTestCaseId) {
    const testCase = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { recordTestCaseId } });
    if (!testCase) {
      throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }
    const { activeSessionId, activeSessionKey, activeDeviceId } = testCase;
    if (!activeSessionId || !activeSessionKey || !activeDeviceId) {
      throw new HttpException(`Session not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }

    const device = await this.dataSource.getRepository(Device).findOne({ where: { deviceId: activeDeviceId } });
    if (!device) {
      throw new HttpException(`Device not found. activeDeviceId: ${testCase.activeDeviceId}`, HttpStatus.NOT_FOUND);
    }

    const batchExecutor: RemoteWebDriverBatchRequestExecutor = makeActionBatchExcutor(
      this.remoteWebDriverService,
      projectId,
      testCase.activeSessionId!,
      testCase.activeSessionKey!,
      device,
    );
    const deleteSessionResponse = new DeleteSessionRemoteWebDriverBatchRequestItem(batchExecutor, activeSessionId);
    await batchExecutor.execute();

    await deleteSessionResponse.response();
    return;
  }
}
