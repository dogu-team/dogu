import {
  RecordTestCaseAndRecordTestStepPropCamel,
  RecordTestCaseAndRecordTestStepPropSnake,
  RecordTestCaseBase,
  RecordTestCasePropCamel,
  RecordTestCasePropSnake,
  RecordTestCaseResponse,
} from '@dogu-private/console';
import {
  extensionFromPlatform,
  OrganizationId,
  platformTypeFromPlatform,
  ProjectId,
  RecordTestCaseId,
  RecordTestScenarioId,
  RecordTestStepId,
  RECORD_TEST_STEP_ACTION_TYPE,
} from '@dogu-private/types';
import {
  DoguApplicationFileSizeHeader,
  DoguApplicationUrlHeader,
  DoguApplicationVersionHeader,
  DoguBrowserNameHeader,
  DoguBrowserVersionHeader,
  DoguDevicePlatformHeader,
  DoguDeviceSerialHeader,
  DoguRemoteDeviceJobIdHeader,
  DoguRequestTimeoutHeader,
  HeaderRecord,
} from '@dogu-tech/common';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull } from 'typeorm';
import { v4 } from 'uuid';
import { Device, RecordTestCaseAndRecordTestStep } from '../../../../db/entity/index';
import { RecordTestCase } from '../../../../db/entity/record-test-case.entity';
import { RecordTestStep } from '../../../../db/entity/record-test-step.entity';
import { EMPTY_PAGE, Page } from '../../../../module/common/dto/pagination/page';
import { ApplicationService } from '../../../../module/project/application/application.service';
import { FindProjectApplicationDto } from '../../../../module/project/application/dto/application.dto';
import { RemoteWebDriverBatchRequestExecutor } from '../../../../module/remote/remote-webdriver/remote-webdriver.batch-request-executor';
import { RemoteWebDriverService } from '../../../../module/remote/remote-webdriver/remote-webdriver.service';
import { NewSessionRemoteWebDriverBatchRequestItem } from '../../../../module/remote/remote-webdriver/remote-webdriver.w3c-batch-request-items';
import { castEntity } from '../../../../types/entity-cast';
import { getSortedRecordTestSteps } from '../common';
import {
  AddRecordTestStepToRecordTestCaseDto,
  CreateRecordTestCaseDto,
  FindRecordTestCaseByProjectIdDto,
  NewSessionDto,
  UpdateRecordTestCaseDto,
} from '../dto/record-test-case.dto';
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

  async findRecordTestCaseById(projectId: ProjectId, recordTestCaseId: string): Promise<RecordTestCaseResponse> {
    const recordTestCase = await this.dataSource
      .getRepository(RecordTestCase) //
      .createQueryBuilder('recordTestCase')
      .leftJoinAndSelect(`recordTestCase.${RecordTestCasePropCamel.recordTestCaseAndRecordTestSteps}`, `recordTestCaseAndRecordTestSteps`)
      .leftJoinAndSelect(`recordTestCaseAndRecordTestSteps.${RecordTestCaseAndRecordTestStepPropCamel.recordTestStep}`, `recordTestStep`)
      .where(`recordTestCase.${RecordTestCasePropSnake.project_id} = :${RecordTestCasePropCamel.projectId}`, { projectId })
      .andWhere(`recordTestCase.${RecordTestCasePropSnake.record_test_case_id} = :recordTestCaseId`, { recordTestCaseId })
      .getOne();

    if (!recordTestCase) {
      throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }

    const rv: RecordTestCaseResponse = {
      ...recordTestCase,
      recordTestSteps: getSortedRecordTestSteps(recordTestCase),
    };
    return rv;
  }

  async createRecordTestCase(projectId: ProjectId, dto: CreateRecordTestCaseDto): Promise<RecordTestCaseBase> {
    const { name } = dto;
    const newData = this.dataSource.getRepository(RecordTestCase).create({
      recordTestCaseId: v4(),
      projectId,
      name,
    });

    const recordTestCase = await this.dataSource.getRepository(RecordTestCase).save(newData);
    return recordTestCase;
  }

  async updateRecordTestCase(projectId: ProjectId, recordTestCaseId: RecordTestCaseId, dto: UpdateRecordTestCaseDto): Promise<RecordTestCaseBase> {
    const { name } = dto;
    const data = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId } });
    if (!data) {
      throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }

    if (data.name === name) {
      throw new HttpException(`RecordTestCase name is same. name: ${name}`, HttpStatus.BAD_REQUEST);
    }

    data.name = name;
    const rv = await this.dataSource.getRepository(RecordTestCase).save(data);
    return rv;
  }

  async deleteRecordTestCase(projectId: ProjectId, recordTestCaseId: RecordTestCaseId): Promise<void> {
    const testCase = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId } });
    if (!testCase) {
      throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }

    // FIXME: join data
    await this.dataSource.getRepository(RecordTestCase).softRemove(testCase);
  }

  async addRecordTestStepToRecordTestCase(
    projectId: ProjectId, //
    recordTestCaseId: RecordTestCaseId,
    dto: AddRecordTestStepToRecordTestCaseDto,
  ): Promise<void> {
    const { recordTestStepId, prevRecordTestStepId } = dto;
    const testCase = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId } });
    if (!testCase) {
      throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }
    const testStep = await this.dataSource.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestStepId } });
    if (!testStep) {
      throw new HttpException(`RecordTestStep not found. recordTestStepId: ${recordTestStepId}`, HttpStatus.NOT_FOUND);
    }

    if (prevRecordTestStepId) {
      const prevTestStep = await this.dataSource.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestStepId: prevRecordTestStepId } });
      if (!prevTestStep) {
        throw new HttpException(`RecordTestStep not found. prevRecordTestStepId: ${prevRecordTestStepId}`, HttpStatus.NOT_FOUND);
      }
    }

    const mappingData = await this.dataSource
      .getRepository(RecordTestCaseAndRecordTestStep) //
      .createQueryBuilder('recordTestCaseAndRecordTestStep')
      .innerJoinAndSelect(`recordTestCaseAndRecordTestStep.${RecordTestCaseAndRecordTestStepPropCamel.recordTestStep}`, 'recordTestStep')
      .leftJoinAndSelect(`recordTestCaseAndRecordTestStep.${RecordTestCaseAndRecordTestStepPropCamel.prevRecordTestStep}`, 'prevRecordTestStep')
      .where(`recordTestCaseAndRecordTestStep.${RecordTestCaseAndRecordTestStepPropSnake.record_test_case_id} = :${RecordTestCaseAndRecordTestStepPropCamel.recordTestCaseId}`, {
        recordTestCaseId,
      })
      .andWhere(`recordTestCaseAndRecordTestStep.${RecordTestCaseAndRecordTestStepPropSnake.record_test_step_id} = :${RecordTestCaseAndRecordTestStepPropCamel.recordTestStepId}`, {
        recordTestStepId,
      })
      .getOne();

    if (mappingData?.prevRecordTestStepId === prevRecordTestStepId) {
      throw new HttpException(`RecordTestCase is already attached. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.BAD_REQUEST);
    }

    await this.dataSource.manager.transaction(async (manager) => {
      if (mappingData) {
        await this.removeRecordTestStepFromMappingTable(manager, recordTestCaseId, mappingData.recordTestStep!);
        await this.addRecordTestStepToMappingTable(manager, recordTestCaseId, mappingData.recordTestStep!, prevRecordTestStepId);
      } else {
        await this.addRecordTestStepToMappingTable(manager, recordTestCaseId, testStep, prevRecordTestStepId);
      }
    });
  }

  async removeRecordTestStepFromRecordTestCase(
    projectId: ProjectId, //
    recordTestCaseId: RecordTestScenarioId,
    recordTestStepId: RecordTestCaseId,
  ): Promise<void> {
    const testCase = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId } });
    if (!testCase) {
      throw new HttpException(`RecordTestCase not found. recordTestScenarioId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }
    const testStep = await this.dataSource.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestStepId } });
    if (!testStep) {
      throw new HttpException(`RecordTestStep not found. recordTestCaseId: ${recordTestStepId}`, HttpStatus.NOT_FOUND);
    }

    const mappingData = await this.dataSource
      .getRepository(RecordTestCaseAndRecordTestStep) //
      .createQueryBuilder('recordTestCaseAndRecordTestStep')
      .innerJoinAndSelect(`recordTestCaseAndRecordTestStep.${RecordTestCaseAndRecordTestStepPropCamel.recordTestStep}`, 'recordTestStep')
      .where(`recordTestCaseAndRecordTestStep.${RecordTestCaseAndRecordTestStepPropSnake.record_test_case_id} = :${RecordTestCaseAndRecordTestStepPropCamel.recordTestCaseId}`, {
        recordTestCaseId,
      })
      .andWhere(`recordTestCaseAndRecordTestStep.${RecordTestCaseAndRecordTestStepPropSnake.record_test_step_id} = :${RecordTestCaseAndRecordTestStepPropCamel.recordTestStepId}`, {
        recordTestStepId,
      })
      .getOne();

    if (!mappingData) {
      throw new HttpException(`RecordTestCaseAndRecordTestStep not found. recordTestCaseId: ${recordTestCaseId}, recordTestStepId: ${recordTestStepId}`, HttpStatus.NOT_FOUND);
    }

    await this.dataSource.manager.transaction(async (manager) => {
      await this.removeRecordTestStepFromMappingTable(manager, recordTestCaseId, testStep);
    });
  }

  private async removeRecordTestStepFromMappingTable(
    manager: EntityManager, //
    recordTestCaseId: RecordTestCaseId,
    recordTestStep: RecordTestStep,
  ): Promise<void> {
    const next = await this.getNextRecordTestStep(manager, recordTestCaseId, recordTestStep);
    if (!next) {
      await manager.getRepository(RecordTestCaseAndRecordTestStep).softDelete({ recordTestCaseId, recordTestStepId: recordTestStep.recordTestStepId });
      return;
    }
    const prev = await this.getPrevRecordTestStep(manager, recordTestCaseId, recordTestStep);
    if (prev) {
      await manager
        .getRepository(RecordTestCaseAndRecordTestStep)
        .update({ recordTestCaseId, recordTestStepId: next.recordTestStepId }, { prevRecordTestStepId: prev.recordTestStepId });
    } else {
      await manager.getRepository(RecordTestCaseAndRecordTestStep).update({ recordTestCaseId, recordTestStepId: next.recordTestStepId }, { prevRecordTestStepId: null });
    }
    await manager.getRepository(RecordTestCaseAndRecordTestStep).softDelete({ recordTestCaseId, recordTestStepId: recordTestStep.recordTestStepId });
  }

  private async addRecordTestStepToMappingTable(
    manager: EntityManager, //
    recordTestCaseId: RecordTestCaseId,
    recordTestStep: RecordTestStep,
    prevRecordTestStepId: RecordTestStepId | null,
  ): Promise<void> {
    // root
    if (!prevRecordTestStepId) {
      const originRoot = await manager.getRepository(RecordTestCaseAndRecordTestStep).findOne({
        where: {
          recordTestCaseId,
          recordTestStepId: IsNull(),
        },
      });
      if (!originRoot) {
        throw new HttpException(`First RecordTestCase not found. recordTestScenarioId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
      }
      originRoot.prevRecordTestStepId = recordTestStep.recordTestStepId;
      await manager.getRepository(RecordTestCaseAndRecordTestStep).save(originRoot);

      const newRoot = manager.getRepository(RecordTestCaseAndRecordTestStep).create({
        recordTestCaseId,
        recordTestStepId: recordTestStep.recordTestStepId,
        prevRecordTestStepId: null,
        deletedAt: null,
      });
      await manager
        .getRepository(RecordTestCaseAndRecordTestStep)
        .upsert(newRoot, [`${RecordTestCaseAndRecordTestStepPropCamel.recordTestCaseId}`, `${RecordTestCaseAndRecordTestStepPropCamel.recordTestStepId}`]);
      return;
    }

    const oldNext = await manager.getRepository(RecordTestCaseAndRecordTestStep).findOne({
      where: {
        recordTestCaseId,
        prevRecordTestStepId,
      },
    });

    // tail
    if (!oldNext) {
      const newTail = manager.getRepository(RecordTestCaseAndRecordTestStep).create({
        recordTestCaseId,
        recordTestStepId: recordTestStep.recordTestStepId,
        prevRecordTestStepId: prevRecordTestStepId,
        deletedAt: null,
      });
      await manager
        .getRepository(RecordTestCaseAndRecordTestStep)
        .upsert(castEntity(newTail), [`${RecordTestCaseAndRecordTestStepPropCamel.recordTestCaseId}`, `${RecordTestCaseAndRecordTestStepPropCamel.recordTestStepId}`]);
      return;
    } else {
      // middle
      const newMiddle = manager.getRepository(RecordTestCaseAndRecordTestStep).create({
        recordTestCaseId,
        recordTestStepId: recordTestStep.recordTestStepId,
        prevRecordTestStepId,
        deletedAt: null,
      });
      await manager
        .getRepository(RecordTestCaseAndRecordTestStep)
        .upsert(castEntity(newMiddle), [`${RecordTestCaseAndRecordTestStepPropCamel.recordTestCaseId}`, `${RecordTestCaseAndRecordTestStepPropCamel.recordTestStepId}`]);
      oldNext.prevRecordTestStepId = recordTestStep.recordTestStepId;
      await manager.getRepository(RecordTestCaseAndRecordTestStep).save(oldNext);
      return;
    }
  }

  private async getNextRecordTestStep(
    manager: EntityManager, //
    recordTestCaseId: RecordTestCaseId,
    recordTestStep: RecordTestStep,
  ): Promise<RecordTestStep | null> {
    const next = await manager
      .getRepository(RecordTestCaseAndRecordTestStep) //
      .createQueryBuilder('caseAndStep')
      .leftJoinAndSelect(`caseAndStep.${RecordTestCaseAndRecordTestStepPropCamel.recordTestStep}`, 'recordTestStep')
      .where(`caseAndStep.${RecordTestCaseAndRecordTestStepPropSnake.record_test_case_id} = :${RecordTestCaseAndRecordTestStepPropCamel.recordTestCaseId}`, {
        recordTestCaseId,
      })
      .andWhere(`caseAndStep.${RecordTestCaseAndRecordTestStepPropSnake.prev_record_test_step_id} = :${RecordTestCaseAndRecordTestStepPropCamel.recordTestStepId}`, {
        prevRecordTestStepId: recordTestStep.recordTestStepId,
      })
      .getOne();
    return next?.recordTestStep ?? null;
  }

  private async getPrevRecordTestStep(
    manager: EntityManager, //
    recordTestCaseId: RecordTestCaseId,
    recordTestStep: RecordTestStep,
  ): Promise<RecordTestStep | null> {
    const current = await manager
      .getRepository(RecordTestCaseAndRecordTestStep)
      .createQueryBuilder('caseAndStep')
      .leftJoinAndSelect(`caseAndStep.${RecordTestCaseAndRecordTestStepPropCamel.prevRecordTestStep}`, 'recordTestStep')
      .where(`caseAndStep.${RecordTestCaseAndRecordTestStepPropSnake.record_test_case_id} = :${RecordTestCaseAndRecordTestStepPropCamel.recordTestCaseId}`, {
        recordTestCaseId,
      })
      .andWhere(`caseAndStep.${RecordTestCaseAndRecordTestStepPropSnake.record_test_step_id} = :${RecordTestCaseAndRecordTestStepPropCamel.recordTestStepId}`, {
        recordTestStepId: recordTestStep.recordTestStepId,
      })
      .getOne();

    const prev = current?.prevRecordTestStep;
    return prev ?? null;
  }

  public async newSession(organizationId: OrganizationId, projectId: ProjectId, recordTestCaseId: RecordTestCaseId, dto: NewSessionDto): Promise<string> {
    const recordTestCase = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId } });
    if (!recordTestCase) {
      throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }

    const { deviceId, appVersion, browserName, browserVersion } = dto;
    const device = await this.dataSource.getRepository(Device).findOne({ where: { deviceId } });
    if (!device) {
      throw new HttpException(`Device not found. deviceId: ${deviceId}`, HttpStatus.NOT_FOUND);
    }
    const platformType = platformTypeFromPlatform(device.platform);
    const activeSessionKey = v4();

    const headers: HeaderRecord = {
      [DoguRemoteDeviceJobIdHeader]: activeSessionKey,
      [DoguDevicePlatformHeader]: platformType,
      [DoguDeviceSerialHeader]: device.serial,
      [DoguRequestTimeoutHeader]: '180000',
    };

    if (appVersion && browserName) {
      throw new HttpException(`appVersion and browserName are exclusive.`, HttpStatus.BAD_REQUEST);
    } else if (browserName) {
      headers[DoguBrowserNameHeader] = browserName;
      if (browserVersion) headers[DoguBrowserVersionHeader] = browserVersion;
    } else if (appVersion) {
      let applicationUrl: string | undefined = undefined;
      let applicationVersion: string | undefined = undefined;
      let applicationFileSize: number | undefined = undefined;
      if (platformType === 'android' || platformType === 'ios') {
        const findAppDto = new FindProjectApplicationDto();
        findAppDto.version = appVersion;
        findAppDto.extension = extensionFromPlatform(platformType);
        const applications = await this.applicationService.getApplicationList(organizationId, projectId, findAppDto);
        if (applications.items.length === 0) {
          throw new HttpException(`Application not found. appVersion: ${appVersion}`, HttpStatus.NOT_FOUND);
        }
        const application = applications.items[0];
        applicationUrl = await this.applicationService.getApplicationDownladUrl(application.projectApplicationId, organizationId, projectId);
        applicationVersion = application.version;
        applicationFileSize = application.fileSize;
        headers[DoguApplicationUrlHeader] = applicationUrl;
        headers[DoguApplicationVersionHeader] = applicationVersion;
        headers[DoguApplicationFileSizeHeader] = applicationFileSize.toString();
      }
    } else {
      throw new HttpException(`appVersion or browserName is required.`, HttpStatus.BAD_REQUEST);
    }

    const batchExecutor = new RemoteWebDriverBatchRequestExecutor(this.remoteWebDriverService, {
      organizationId,
      projectId,
      deviceId,
      deviceSerial: device.serial,
      headers: headers,
      parallel: true,
    });

    const newSessionResponse = new NewSessionRemoteWebDriverBatchRequestItem(batchExecutor, {});
    await batchExecutor.execute();

    const res = await newSessionResponse.response();
    const capabilities = res.value.capabilities as Record<string, unknown>;
    const deviceScreenSize = capabilities['deviceScreenSize'] as string;

    recordTestCase.activeDeviceScreenSize = deviceScreenSize;
    recordTestCase.activeSessionId = res.value.sessionId;
    recordTestCase.activeSessionKey = activeSessionKey;
    await this.dataSource.getRepository(RecordTestCase).save(recordTestCase);

    return res.value.sessionId;
  }

  async test(): Promise<void> {
    const organizationId = '664790a4-df0a-4043-b61a-7ea371f354f8';
    const projectId = '287ad1bf-0e17-4c97-bbda-50a2cc0ac49b';
    const deviceId = '01be2acc-5a5f-4bda-93e5-a591996d475b';
    const createTestCaseDto: CreateRecordTestCaseDto = {
      name: 'test',
    };
    const testCase = await this.createRecordTestCase(projectId, createTestCaseDto);

    const dto: NewSessionDto = {
      deviceId,
      browserName: 'chrome',
    };

    const sessionId = await this.newSession(organizationId, projectId, testCase.recordTestCaseId, dto);
    const testStep = await this.recordTestStepService.createRecordTestStep(projectId, { name: 'test' });
    await this.recordTestStepService.addAction(organizationId, projectId, testStep.recordTestStepId, {
      recordTestCaseId: testCase.recordTestCaseId,
      deviceId,
      type: RECORD_TEST_STEP_ACTION_TYPE.WEBDRIVER_CLICK,
      screenPositionX: 0,
      screenPositionY: 0,
    });

    const testStepResult = await this.recordTestStepService.findRecordTestStepById(projectId, testStep.recordTestStepId);
    return;
  }
}
