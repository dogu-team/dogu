import { RecordTestCaseBase, RecordTestCasePropCamel, RecordTestCasePropSnake, RecordTestCaseResponse, RecordTestStepResponse } from '@dogu-private/console';
import { extensionFromPlatform, OrganizationId, platformTypeFromPlatform, ProjectId, RecordTestCaseId } from '@dogu-private/types';
import {
  DoguApplicationFileSizeHeader,
  DoguApplicationUrlHeader,
  DoguApplicationVersionHeader,
  DoguBrowserNameHeader,
  DoguDevicePlatformHeader,
  DoguDeviceSerialHeader,
  DoguRemoteDeviceJobIdHeader,
  DoguRequestTimeoutHeader,
  HeaderRecord,
} from '@dogu-tech/common';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import { Device } from '../../../../db/entity/index';
import { ProjectApplication } from '../../../../db/entity/project-application.entity';
import { RecordTestCase } from '../../../../db/entity/record-test-case.entity';
import { EMPTY_PAGE, Page } from '../../../../module/common/dto/pagination/page';
import { ApplicationService } from '../../../../module/project/application/application.service';
import { FindProjectApplicationDto } from '../../../../module/project/application/dto/application.dto';
import { AppiumIsKeyboardShownRemoteWebDriverBatchRequestItem } from '../../../../module/remote/remote-webdriver/remote-webdriver.appium-batch-request-items';
import { RemoteWebDriverBatchRequestExecutor } from '../../../../module/remote/remote-webdriver/remote-webdriver.batch-request-executor';
import { RemoteWebDriverService } from '../../../../module/remote/remote-webdriver/remote-webdriver.service';
import {
  DeleteSessionRemoteWebDriverBatchRequestItem,
  NewSessionRemoteWebDriverBatchRequestItem,
} from '../../../../module/remote/remote-webdriver/remote-webdriver.w3c-batch-request-items';
import { makeActionBatchExcutor } from '../common';
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
    const activeDeviceSerial = recordTestCase.activeDeviceSerial;
    if (!activeDeviceSerial) {
      throw new HttpException(`Device does not have activeDeviceSerial. RecordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }

    const device = await this.dataSource.getRepository(Device).findOne({ where: { organizationId, serial: activeDeviceSerial } });
    if (!device) {
      throw new HttpException(`Device not found. deviceSerial: ${recordTestCase.activeDeviceSerial}`, HttpStatus.NOT_FOUND);
    }

    const batchExecutor: RemoteWebDriverBatchRequestExecutor = makeActionBatchExcutor(this.remoteWebDriverService, organizationId, projectId, recordTestCase, device);
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
    const stepResponses: RecordTestStepResponse[] = [];
    const recordTestSteps = recordTestCase.recordTestSteps ?? [];
    for (const step of recordTestSteps) {
      const stepResponse = await this.recordTestStepService.findRecordTestStepById(organizationId, projectId, recordTestCaseId, step.recordTestStepId);
      stepResponses.push(stepResponse);
    }
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

    // const device = await this.dataSource.getRepository(Device).findOne({ where: { deviceId } });
    // if (!device) {
    //   throw new HttpException(`Device not found. deviceId: ${deviceId}`, HttpStatus.NOT_FOUND);
    // }
    const newData = this.dataSource.getRepository(RecordTestCase).create({
      recordTestCaseId: v4(),
      projectId,
      name,
      activeDeviceSerial: null,
      activeDeviceScreenSizeX: null,
      activeDeviceScreenSizeY: null,
      activeSessionId: null,
      activeSessionKey: null,
      packageName,
      browserName,
    });

    const recordTestCase = await this.dataSource.getRepository(RecordTestCase).save(newData);

    // const rv = await this.dataSource.manager.transaction(async (manager) => {
    //   const newSessionDto: NewSessionDto = { deviceId };
    //   const newData = manager.getRepository(RecordTestCase).create({
    //     recordTestCaseId: v4(),
    //     projectId,
    //     name,
    //     activeDeviceSerial: device.serial,
    //     activeDeviceScreenSizeX,
    //     activeDeviceScreenSizeY,
    //     packageName,
    //     browserName,
    //   });

    //   if (packageName) {
    //     const app = await manager.getRepository(ProjectApplication).findOne({ where: { projectId, package: packageName }, order: { createdAt: 'DESC' } });
    //     if (!app) {
    //       throw new HttpException(`ProjectApplication not found. packageName: ${packageName}`, HttpStatus.NOT_FOUND);
    //     }
    //     newSessionDto.appVersion = app.version;
    //   }

    //   if (browserName) {
    //     newSessionDto.browserName = browserName;
    //   }

    //   const sessionId = await this.newSession(manager, organizationId, projectId, recordTestCase, newSessionDto);

    //   return recordTestCase;
    // });
    return recordTestCase;
  }

  // async loadRecordTestCase(organizationId: OrganizationId, projectId: ProjectId, recordTestCaseId: RecordTestCaseId, dto: LoadRecordTestCaseDto): Promise<RecordTestCaseResponse> {
  //   const { deviceId, activeDeviceScreenSizeX, activeDeviceScreenSizeY } = dto;
  //   const testCase = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId }, relations: [RecordTestCasePropCamel.recordTestSteps] });
  //   if (!testCase) {
  //     throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
  //   }

  //   const newSessionDto: NewSessionDto = {
  //     deviceId,
  //   };

  //   if (testCase.packageName) {
  //     const app = await this.dataSource.getRepository(ProjectApplication).findOne({ where: { projectId, package: testCase.packageName }, order: { createdAt: 'DESC' } });
  //     if (!app) {
  //       throw new HttpException(`ProjectApplication not found. packageName: ${testCase.packageName}`, HttpStatus.NOT_FOUND);
  //     }
  //     newSessionDto.appVersion = app.version;
  //   } else if (testCase.browserName) {
  //     newSessionDto.browserName = testCase.browserName;
  //   } else {
  //     throw new HttpException(`packageName or browserName is required`, HttpStatus.BAD_REQUEST);
  //   }

  //   const sessionId = await this.newSession(this.dataSource.manager, organizationId, projectId, testCase, newSessionDto);

  //   testCase.recordTestSteps = getSortedRecordTestSteps(testCase);

  //   return testCase;
  // }

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

  async deleteRecordTestCase(projectId: ProjectId, recordTestCaseId: RecordTestCaseId): Promise<void> {
    // const testCase = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId } });
    // if (!testCase) {
    //   throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    // }
    // // FIXME: join data
    // await this.dataSource.getRepository(RecordTestCase).softRemove(testCase);
  }

  public async newSession(
    manager: EntityManager,
    organizationId: OrganizationId,
    projectId: ProjectId,
    recordTestCaseId: RecordTestCaseId,
    dto: NewSessionRecordTestCaseDto,
  ): Promise<RecordTestCaseBase> {
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

    const platformType = platformTypeFromPlatform(device.platform);
    const activeSessionKey = v4();

    const headers: HeaderRecord = {
      [DoguRemoteDeviceJobIdHeader]: activeSessionKey,
      [DoguDevicePlatformHeader]: platformType,
      [DoguDeviceSerialHeader]: device.serial,
      [DoguRequestTimeoutHeader]: '180000',
    };

    if (packageName && browserName) {
      throw new HttpException(`appVersion and browserName are exclusive.`, HttpStatus.BAD_REQUEST);
    } else if (browserName) {
      headers[DoguBrowserNameHeader] = browserName;
      // if (browserVersion) headers[DoguBrowserVersionHeader] = browserVersion;
    } else if (packageName) {
      const app = await manager.getRepository(ProjectApplication).findOne({ where: { projectId, package: packageName }, order: { createdAt: 'DESC' } });
      if (!app) {
        throw new HttpException(`ProjectApplication not found. packageName: ${packageName}`, HttpStatus.NOT_FOUND);
      }
      let applicationUrl: string | undefined = undefined;
      let applicationVersion: string | undefined = undefined;
      let applicationFileSize: number | undefined = undefined;
      if (platformType === 'android' || platformType === 'ios') {
        const findAppDto = new FindProjectApplicationDto();
        findAppDto.version = app.version;
        findAppDto.extension = extensionFromPlatform(platformType);
        const applications = await this.applicationService.getApplicationList(organizationId, projectId, findAppDto);
        if (applications.items.length === 0) {
          throw new HttpException(`Application not found. appVersion: ${app.version}`, HttpStatus.NOT_FOUND);
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

    testCase.activeDeviceScreenSizeX = Number(deviceScreenSize.split('x')[0]);
    testCase.activeDeviceScreenSizeY = Number(deviceScreenSize.split('x')[1]);
    testCase.activeSessionId = res.value.sessionId;
    testCase.activeSessionKey = activeSessionKey;
    testCase.activeDeviceSerial = device.serial;
    await manager.getRepository(RecordTestCase).save(testCase);

    return testCase;
  }

  async deleteSession(organizationId: OrganizationId, projectId: ProjectId, recordTestCaseId: RecordTestCaseId) {
    const testCase = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { recordTestCaseId } });
    if (!testCase) {
      throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }
    const { activeSessionId, activeSessionKey, activeDeviceSerial } = testCase;
    if (!activeSessionId || !activeSessionKey || !activeDeviceSerial) {
      throw new HttpException(`Session not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }

    const device = await this.dataSource.getRepository(Device).findOne({ where: { serial: activeDeviceSerial } });
    if (!device) {
      throw new HttpException(`Device not found. serial: ${testCase.activeDeviceSerial}`, HttpStatus.NOT_FOUND);
    }

    const batchExecutor: RemoteWebDriverBatchRequestExecutor = makeActionBatchExcutor(this.remoteWebDriverService, organizationId, projectId, testCase, device);
    const deleteSessionResponse = new DeleteSessionRemoteWebDriverBatchRequestItem(batchExecutor, activeSessionId);
    await batchExecutor.execute();

    await deleteSessionResponse.response();
    return;
  }
}
