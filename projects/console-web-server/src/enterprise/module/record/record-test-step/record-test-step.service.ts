import { RecordTestStepBase, RecordTestStepPropCamel, RecordTestStepPropSnake } from '@dogu-private/console';
import { OrganizationId, ProjectId, RecordTestCaseId, RecordTestStepId } from '@dogu-private/types';
import { stringify, toISOStringWithTimezone } from '@dogu-tech/common';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull } from 'typeorm';
import { v4 } from 'uuid';
import { Device } from '../../../../db/entity/device.entity';
import { RecordTestCase } from '../../../../db/entity/record-test-case.entity';
import { RecordTestStep } from '../../../../db/entity/record-test-step.entity';
import { FeatureFileService } from '../../../../module/feature/file/feature-file.service';
import { DoguLogger } from '../../../../module/logger/logger';
import { AppiumIsKeyboardShownRemoteWebDriverBatchRequestItem } from '../../../../module/remote/remote-webdriver/remote-webdriver.appium-batch-request-items';
import { RemoteWebDriverBatchRequestExecutor } from '../../../../module/remote/remote-webdriver/remote-webdriver.batch-request-executor';
import { RemoteWebDriverRequestOptions, RemoteWebDriverService } from '../../../../module/remote/remote-webdriver/remote-webdriver.service';
import {
  DeleteSessionRemoteWebDriverBatchRequestItem,
  NewSessionRemoteWebDriverBatchRequestItem,
  W3CElementClickRemoteWebDriverBatchRequestItem,
  W3CElementSendKeysRemoteWebDriverBatchRequestItem,
  W3CFindElementRemoteWebDriverBatchRequestItem,
  W3CGetPageSourceRemoteWebDriverBatchRequestItem,
  W3CGetTimeoutsRemoteWebDriverBatchRequestItem,
  W3CNavigateToRemoteWebDriverBatchRequestItem,
  W3CPerformActionsRemoteWebDriverBatchRequestItem,
  W3CTakeScreenshotRemoteWebDriverBatchRequestItem,
} from '../../../../module/remote/remote-webdriver/remote-webdriver.w3c-batch-request-items';
import { makeActionBatchExcutor } from '../common';
// import { AddRecordTestStepToRecordTestCaseDto } from '../dto/record-test-case.dto';
import { CreateRecordTestStepDto } from '../dto/record-test-step.dto';

@Injectable()
export class RecordTestStepService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,

    // @Inject(RemoteService)
    // private readonly remoteService: RemoteService,

    @Inject(RemoteWebDriverService)
    private readonly remoteWebDriverService: RemoteWebDriverService,

    @Inject(FeatureFileService)
    private readonly featureFileService: FeatureFileService,

    private readonly logger: DoguLogger,
  ) {}

  async findRecordTestStepById(projectId: ProjectId, recordTestCaseId: RecordTestStepId, recordTestStepId: RecordTestStepId): Promise<RecordTestStepBase> {
    const recordTestStep = await this.dataSource
      .getRepository(RecordTestStep) //
      .createQueryBuilder('recordTestStep')
      // .leftJoinAndSelect(`recordTestStep.${RecordTestStepPropCamel.recordTestStepActions}`, 'recordTestStepAction')
      .where(`recordTestStep.${RecordTestStepPropSnake.record_test_step_id} = :${RecordTestStepPropCamel.recordTestStepId}`, { recordTestStepId })
      .andWhere(`recordTestStep.${RecordTestStepPropSnake.record_test_case_id} = :${RecordTestStepPropCamel.recordTestCaseId}`, { recordTestCaseId })
      .andWhere(`recordTestStep.${RecordTestStepPropSnake.project_id} = :${RecordTestStepPropCamel.projectId}`, { projectId })
      .getOne();

    if (!recordTestStep) {
      throw new HttpException(`RecordTestStep not found. recordTestStepId: ${recordTestStepId}`, HttpStatus.NOT_FOUND);
    }

    return recordTestStep;
  }

  async deleteRecordTestStep(projectId: ProjectId, recordTestCaseId: RecordTestCaseId, recordTestStepId: RecordTestStepId): Promise<void> {
    // const testStep = await this.dataSource.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestCaseId, recordTestStepId } });
    // if (!testStep) {
    //   throw new HttpException(`RecordTestStep not found. recordTestStepId: ${recordTestStepId}`, HttpStatus.NOT_FOUND);
    // }
    // // FIXME: join data
    // await this.dataSource.getRepository(RecordTestStep).softRemove(testStep);
  }

  public async createRecordTestStep(
    organizationId: OrganizationId,
    projectId: ProjectId, //
    recordTestCaseId: RecordTestCaseId,
    dto: CreateRecordTestStepDto,
  ): Promise<RecordTestStep> {
    const rv = await this.dataSource.manager.transaction(async (manager) => {
      const { prevRecordTestStepId } = dto;
      const actionData = dto.actionInfo;

      actionData.type;

      const testCase = await manager.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId } });
      if (!testCase) {
        throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
      }
      if (!testCase.activeDeviceSerial) {
        throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
      }

      // create recordTestStep
      const recordTestStepId = v4();
      const newData = manager.getRepository(RecordTestStep).create({
        recordTestStepId,
        recordTestCaseId,
        projectId,
        prevRecordTestStepId,
        deviceSerial: testCase.activeDeviceSerial,
        screenshotUrl: '', //
      });

      let testStep: RecordTestStep;
      if (prevRecordTestStepId) {
        const prev = await manager.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestStepId: prevRecordTestStepId } });
        if (!prev) {
          throw new HttpException(`RecordTestStep not found. prevRecordTestStepId: ${prevRecordTestStepId}`, HttpStatus.NOT_FOUND);
        }
        // attech prevRecordTestStep
        const next = await this.getNextRecordTestStep(manager, projectId, recordTestCaseId, prev);
        testStep = await manager.getRepository(RecordTestStep).save(newData);
        if (next) {
          next.prevRecordTestStepId = recordTestStepId;
          await manager.getRepository(RecordTestStep).save(next);
        }
      } else {
        // root test step
        const root = await manager.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestCaseId, prevRecordTestStepId: IsNull() } });
        testStep = await manager.getRepository(RecordTestStep).save(newData);
        if (root) {
          root.prevRecordTestStepId = recordTestStepId;
          await manager.getRepository(RecordTestStep).save(root);
        }
      }

      // add action
      await this.addAction(manager, organizationId, projectId, testStep, dto);

      return testStep;
    });
    return rv;
  }

  async removeRecordTestStepFromRecordTestCase(
    manager: EntityManager,
    projectId: ProjectId,
    recordTestCaseId: RecordTestCaseId,
    recordTestStepId: RecordTestCaseId,
  ): Promise<void> {
    const testStep = await manager.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestCaseId, recordTestStepId } });
    if (!testStep) {
      throw new HttpException(`RecordTestStep not found. recordTestStepId: ${recordTestStepId}`, HttpStatus.NOT_FOUND);
    }
    const next = await this.getNextRecordTestStep(manager, projectId, recordTestCaseId, testStep);
    if (!next) {
      // FIXME: (felix) remove join table
      // await manager.getRepository(RecordTestStep).softDelete({ recordTestCaseId, recordTestStepId });
      // deleteRecordTestStep
      return;
    }

    const prev = await this.getPrevRecordTestStep(manager, projectId, recordTestCaseId, testStep);
    if (prev) {
      await manager.getRepository(RecordTestStep).update({ projectId, recordTestCaseId, recordTestStepId: next.recordTestStepId }, { prevRecordTestStepId: prev.recordTestStepId });
    } else {
      await manager.getRepository(RecordTestStep).update({ projectId, recordTestCaseId, recordTestStepId: next.recordTestStepId }, { prevRecordTestStepId: null });
    }

    // FIXME: (felix) remove join table
    // await manager.getRepository(RecordTestStep).softDelete({ projectId, recordTestCaseId, recordTestStepId });
    return;
  }

  private async getNextRecordTestStep(
    manager: EntityManager, //
    projectId: ProjectId,
    recordTestCaseId: RecordTestCaseId,
    recordTestStep: RecordTestStep,
  ): Promise<RecordTestStep | null> {
    const next = await manager.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestCaseId, prevRecordTestStepId: recordTestStep.recordTestStepId } });
    if (!next) {
      return null;
    }
    return next;
  }

  private async getPrevRecordTestStep(
    manager: EntityManager, //
    projectId: ProjectId,
    recordTestCaseId: RecordTestCaseId,
    recordTestStep: RecordTestStep,
  ): Promise<RecordTestStep | null> {
    if (!recordTestStep.prevRecordTestStepId) {
      return null;
    }
    const prev = await manager.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestCaseId, recordTestStepId: recordTestStep.prevRecordTestStepId } });
    if (!prev) {
      throw new HttpException(
        `PrevRecordTestStep not found. recordTestStepId: ${recordTestStep.recordTestStepId}, prevRecordTestStepId: ${recordTestStep.prevRecordTestStepId}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return prev;
  }

  async addAction(manager: EntityManager, organizationId: OrganizationId, projectId: ProjectId, recordTestStep: RecordTestStep, dto: CreateRecordTestStepDto): Promise<void> {
    // const { deviceId } = dto;
    const actionData = dto.actionInfo;
    const { type } = actionData;
    const { recordTestCaseId } = recordTestStep;

    const recordTestCase = await manager.getRepository(RecordTestCase).findOne({ where: { recordTestCaseId } });
    if (!recordTestCase) {
      throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }
    const activeDeviceSerial = recordTestCase.activeDeviceSerial;
    if (!activeDeviceSerial) {
      throw new HttpException(`Device does not have activeDeviceSerial. RecordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }

    const device = await manager.getRepository(Device).findOne({ where: { organizationId, serial: activeDeviceSerial } });
    if (!device) {
      throw new HttpException(`Device not found. deviceSerial: ${recordTestCase.activeDeviceSerial}`, HttpStatus.NOT_FOUND);
    }

    const batchExecutor: RemoteWebDriverBatchRequestExecutor = makeActionBatchExcutor(this.remoteWebDriverService, organizationId, projectId, recordTestCase, device);

    // FIXME: (felix)
    const screenShotUrlKey = `test-record-test-step-action/${recordTestCase.activeSessionId}/${toISOStringWithTimezone(new Date(), '-')}.png`;

    const takeScreenshot = new W3CTakeScreenshotRemoteWebDriverBatchRequestItem(batchExecutor, recordTestCase.activeSessionId!);
    await batchExecutor.execute();

    const screenshotBuffer = await takeScreenshot.response();
    const putResult = await this.featureFileService.put({
      bucketKey: 'organization',
      key: screenShotUrlKey,
      body: screenshotBuffer,
      contentType: 'image/png',
    });
    const url = putResult.location;

    recordTestStep.screenshotUrl = url;
    manager.getRepository(RecordTestStep).save(recordTestStep);

    switch (type) {
      case 'WEBDRIVER_CLICK':
        break;
      case 'WEBDRIVER_INPUT':
        break;
      // case RECORD_TEST_STEP_ACTION_TYPE.UNSPECIFIED:
      //   break;
      default:
        const _exhaustiveCheck: never = type;
        throw new HttpException(`Unknown action type: ${type}`, HttpStatus.BAD_REQUEST);
    }

    // screenShot = takeScreenshot()

    // document = parse(pageSource)
    // pageSource = getPageSource()
    // element = find(document, screenSize, screenPosition)

    // new session
    // const key = v4();

    // action
    // elementId = findElement(element -> xpath)
    // elementClick(elementId)
    // return action;
  }

  //FIXME:(felix) test code
  async newSessionTest2(key: string): Promise<string> {
    const newSessionOption = {
      organizationId: '664790a4-df0a-4043-b61a-7ea371f354f8',
      remoteDeviceJobId: key,
      projectId: '287ad1bf-0e17-4c97-bbda-50a2cc0ac49b',
      deviceId: '01be2acc-5a5f-4bda-93e5-a591996d475b',
      devicePlatform: 'android',
      deviceSerial: 'ce0617162acaba2002',
      applicationUrl:
        'http://nexus.dev.dogutech.io:8081/repository/organization/organizations/664790a4-df0a-4043-b61a-7ea371f354f8/projects/287ad1bf-0e17-4c97-bbda-50a2cc0ac49b/apks/Wikipedia_Alpha-2.5.194-alpha-2017-05-30-158429e42dc8792ab342f49be59e2a46.apk',
      applicationVersion: '2.5.194-alpha-2017-05-30',
      headers: {
        'dogu-remote-device-job-id': key,
        'dogu-device-platform': 'android',
        'dogu-device-serial': 'ce0617162acaba2002',
        'dogu-request-timeout': '180000',
        // 'dogu-application-url':
        //   'http://nexus.dev.dogutech.io:8081/repository/organization/organizations/664790a4-df0a-4043-b61a-7ea371f354f8/projects/287ad1bf-0e17-4c97-bbda-50a2cc0ac49b/apks/Wikipedia_Alpha-2.5.194-alpha-2017-05-30-158429e42dc8792ab342f49be59e2a46.apk',
        // 'dogu-application-version': '2.5.194-alpha-2017-05-30',
        // 'dogu-application-file-size': '20373104',
      },
    };
    const { organizationId, projectId, deviceId, deviceSerial } = newSessionOption;
    const batchExecutor = new RemoteWebDriverBatchRequestExecutor(this.remoteWebDriverService, {
      organizationId,
      projectId,
      deviceId,
      deviceSerial,
      headers: newSessionOption.headers,
      parallel: true,
    });

    const newSessionResponse = new NewSessionRemoteWebDriverBatchRequestItem(batchExecutor, {});
    await batchExecutor.execute();

    const res = await newSessionResponse.response();
    return res.value.sessionId;
  }

  //FIXME:(felix) test code
  async newSessionTest(key: string, isChrome: boolean): Promise<string> {
    const newSessionOption = {
      organizationId: '664790a4-df0a-4043-b61a-7ea371f354f8',
      projectId: '287ad1bf-0e17-4c97-bbda-50a2cc0ac49b',
      deviceId: '01be2acc-5a5f-4bda-93e5-a591996d475b',
      deviceSerial: 'ce0617162acaba2002',
    };

    const headers: Record<string, string> = {
      'dogu-remote-device-job-id': key,
      'dogu-device-platform': 'android',
      'dogu-device-serial': 'ce0617162acaba2002',
      'dogu-request-timeout': '180000',
    };
    if (isChrome) {
      headers['dogu-browser-name'] = 'chrome';
    }

    const { organizationId, projectId, deviceId, deviceSerial } = newSessionOption;
    const batchExecutor = new RemoteWebDriverBatchRequestExecutor(this.remoteWebDriverService, {
      organizationId,
      projectId,
      deviceId,
      deviceSerial,
      headers,
      parallel: true,
    });

    const newSessionResponse = new NewSessionRemoteWebDriverBatchRequestItem(batchExecutor, {});
    await batchExecutor.execute();

    const res = await newSessionResponse.response();
    // if ('deviceScreenSize' in res.value.capabilities) {
    // }
    // const capa = res.value.capabilities as Record<string, unknown>;
    // const deviceScreenSize = capa['deviceScreenSize'] as string;

    return res.value.sessionId;
  }

  //FIXME:(felix) test code
  async deleteSessionTest(key: string, sessionId: string): Promise<void> {
    const newSessionOption = {
      organizationId: '664790a4-df0a-4043-b61a-7ea371f354f8',
      projectId: '287ad1bf-0e17-4c97-bbda-50a2cc0ac49b',
      deviceId: '01be2acc-5a5f-4bda-93e5-a591996d475b',
      deviceSerial: 'ce0617162acaba2002',
      headers: {
        'dogu-remote-device-job-id': key,
        'dogu-device-platform': 'android',
        'dogu-device-serial': 'ce0617162acaba2002',
        'dogu-request-timeout': '180000',
        'dogu-browser-name': 'chrome',
      },
    };
    const { organizationId, projectId, deviceId, deviceSerial } = newSessionOption;
    const batchExecutor = new RemoteWebDriverBatchRequestExecutor(this.remoteWebDriverService, {
      organizationId,
      projectId,
      deviceId,
      deviceSerial,
      headers: newSessionOption.headers,
      parallel: true,
    });

    const deleteSessionResponse = new DeleteSessionRemoteWebDriverBatchRequestItem(batchExecutor, sessionId);
    await batchExecutor.execute();

    await deleteSessionResponse.response();
    return;
  }

  //FIXME:(felix) test code
  async screenshotAndActionTest1(key: string, sessionId: string): Promise<void> {
    const start = Date.now();

    const actionOption = {
      organizationId: '664790a4-df0a-4043-b61a-7ea371f354f8',
      projectId: '287ad1bf-0e17-4c97-bbda-50a2cc0ac49b',
      deviceId: '01be2acc-5a5f-4bda-93e5-a591996d475b',
      deviceSerial: 'ce0617162acaba2002',
      headers: {
        'dogu-remote-device-job-id': key,
        'dogu-device-platform': 'android',
        'dogu-device-serial': 'ce0617162acaba2002',
        'dogu-request-timeout': '60000',
        'dogu-browser-name': 'chrome',
      },
    };

    const { organizationId, projectId, deviceId, deviceSerial, headers } = actionOption;
    const batchExecutor = new RemoteWebDriverBatchRequestExecutor(this.remoteWebDriverService, {
      organizationId,
      projectId,
      deviceId,
      deviceSerial,
      headers,
      parallel: true,
    });

    const getPageSource = new W3CGetPageSourceRemoteWebDriverBatchRequestItem(batchExecutor, sessionId);
    const takeScreenshot = new W3CTakeScreenshotRemoteWebDriverBatchRequestItem(batchExecutor, sessionId);
    const appiumIsKeyboardShown = new AppiumIsKeyboardShownRemoteWebDriverBatchRequestItem(batchExecutor, sessionId);
    const findElement = new W3CFindElementRemoteWebDriverBatchRequestItem(batchExecutor, sessionId, 'xpath', '//*');
    await batchExecutor.execute();
    await takeScreenshot
      .response()
      .then(async (buffer) => {
        const putResult = await this.featureFileService.put({
          bucketKey: 'organization',
          key: `pk-remote-device-jobs/${key}/${toISOStringWithTimezone(new Date(), '-')}.png`,
          body: buffer,
          contentType: 'image/png',
        });
        this.logger.debug(`TEST: screenshot url: ${putResult.location}`);
      })
      .catch((error) => {
        this.logger.error(`TEST: screenshot error: ${stringify(error)}`);
      });
    await getPageSource
      .response()
      .then((pageSource) => {
        this.logger.debug(`TEST: pageSource size: ${pageSource.length}`);
      })
      .catch((error) => {
        this.logger.error(`TEST: pageSource error: ${stringify(error)}`);
      });
    await appiumIsKeyboardShown
      .response()
      .then((isKeyboardShown) => {
        this.logger.debug(`TEST: isKeyboardShown: ${isKeyboardShown}`);
      })
      .catch((error) => {
        this.logger.error(`TEST: isKeyboardShown error: ${stringify(error)}`);
      });

    await findElement
      .response()
      .then(async (elementId) => {
        this.logger.debug(`TEST: findElement: ${stringify(elementId)}`);
        const batchExecutor = new RemoteWebDriverBatchRequestExecutor(this.remoteWebDriverService, {
          organizationId,
          projectId,
          deviceId,
          deviceSerial,
          headers,
          parallel: true,
        });
        const click = new W3CElementClickRemoteWebDriverBatchRequestItem(batchExecutor, sessionId, elementId);
        const sendKeys = new W3CElementSendKeysRemoteWebDriverBatchRequestItem(batchExecutor, sessionId, elementId, 'test');
        const performActions = new W3CPerformActionsRemoteWebDriverBatchRequestItem(batchExecutor, sessionId, []);
        const getTimeouts = new W3CGetTimeoutsRemoteWebDriverBatchRequestItem(batchExecutor, sessionId);
        await batchExecutor.execute();

        await click
          .response()
          .then(() => {
            this.logger.debug(`TEST: click`);
          })
          .catch((error) => {
            this.logger.error(`TEST: click error: ${stringify(error)}`);
          });
        await sendKeys
          .response()
          .then(() => {
            this.logger.debug(`TEST: sendKeys`);
          })
          .catch((error) => {
            this.logger.error(`TEST: sendKeys error: ${stringify(error)}`);
          });
        await performActions
          .response()
          .then(() => {
            this.logger.debug(`TEST: performActions`);
          })
          .catch((error) => {
            this.logger.error(`TEST: performActions error: ${stringify(error)}`);
          });
        await getTimeouts
          .response()
          .then((timeouts) => {
            this.logger.debug(`TEST: getTimeouts: ${stringify(timeouts)}`);
          })
          .catch((error) => {
            this.logger.error(`TEST: getTimeouts error: ${stringify(error)}`);
          });
      })
      .catch((error) => {
        this.logger.error(`TEST: findElement error: ${stringify(error)}`);
      });
  }

  //FIXME:(felix) test code
  async screenshotAndActionTest2(key: string, sessionId: string): Promise<void> {
    const start = Date.now();

    const actionOption: RemoteWebDriverRequestOptions = {
      organizationId: '664790a4-df0a-4043-b61a-7ea371f354f8',
      projectId: '287ad1bf-0e17-4c97-bbda-50a2cc0ac49b',
      // remoteDeviceJobId: "9e2da82d-55b9-404b-8ae2-67d7673f599a",
      deviceId: '01be2acc-5a5f-4bda-93e5-a591996d475b',
      // devicePlatform: "android",
      deviceSerial: 'ce0617162acaba2002',
      // browserName: "chrome",
      // browserVersion: undefined,
      request: {
        path: `/session/${sessionId}/url`,
        headers: {
          // 'user-agent': 'webdriver/8.13.1',
          // 'content-type': 'application/json; charset=utf-8',
          // connection: 'keep-alive',
          // accept: 'application/json',
          // 'content-length': '30',
          // 'accept-encoding': 'gzip, deflate, br',
          // host: 'localhost:4000',
        },
        method: 'POST',
        query: undefined,
        reqBody: {
          url: 'https://dogutech.io/',
        },
      },
      headers: {
        'dogu-remote-device-job-id': key,
        'dogu-device-platform': 'android',
        'dogu-device-serial': 'ce0617162acaba2002',
        'dogu-request-timeout': '60000',
        // 'dogu-browser-name': 'chrome',
        // app & app download url
      },
    };

    const { organizationId, projectId, deviceId, deviceSerial, headers } = actionOption;
    const batchExecutor = new RemoteWebDriverBatchRequestExecutor(this.remoteWebDriverService, {
      organizationId,
      projectId,
      deviceId,
      deviceSerial,
      headers,
      parallel: true,
    });

    // const getPageSource = new W3CGetPageSourceRemoteWebDriverBatchRequestItem(batchExecutor, sessionId);
    const takeScreenshot = new W3CTakeScreenshotRemoteWebDriverBatchRequestItem(batchExecutor, sessionId);
    // const appiumIsKeyboardShown = new AppiumIsKeyboardShownRemoteWebDriverBatchRequestItem(batchExecutor, sessionId);
    const navigateTo = new W3CNavigateToRemoteWebDriverBatchRequestItem(batchExecutor, sessionId, 'https://dogutech.io');

    // const findElement = new W3CFindElementRemoteWebDriverBatchRequestItem(batchExecutor, sessionId, 'xpath', '//*');
    await batchExecutor.execute();
    await takeScreenshot
      .response()
      .then(async (buffer) => {
        const putResult = await this.featureFileService.put({
          bucketKey: 'organization',
          key: `pk-remote-device-jobs/${key}/${toISOStringWithTimezone(new Date(), '-')}.png`,
          body: buffer,
          contentType: 'image/png',
        });
        this.logger.debug(`TEST: screenshot url: ${putResult.location}`);
      })
      .catch((error) => {
        this.logger.error(`TEST: screenshot error: ${stringify(error)}`);
      });
  }

  //FIXME:(felix) test code
  async screenshotAndActionTest3(key: string, sessionId: string): Promise<void> {
    const start = Date.now();

    const actionOption = {
      organizationId: '664790a4-df0a-4043-b61a-7ea371f354f8',
      projectId: '287ad1bf-0e17-4c97-bbda-50a2cc0ac49b',
      // remoteDeviceJobId: "9e2da82d-55b9-404b-8ae2-67d7673f599a",
      deviceId: '01be2acc-5a5f-4bda-93e5-a591996d475b',
      // devicePlatform: "android",
      deviceSerial: 'ce0617162acaba2002',
      // browserName: "chrome",
      // browserVersion: undefined,
      // request: {
      //   path: `/session/${sessionId}/url`,
      //   headers: {
      //     // 'user-agent': 'webdriver/8.13.1',
      //     // 'content-type': 'application/json; charset=utf-8',
      //     // connection: 'keep-alive',
      //     // accept: 'application/json',
      //     // 'content-length': '30',
      //     // 'accept-encoding': 'gzip, deflate, br',
      //     // host: 'localhost:4000',
      //   },
      //   method: 'POST',
      //   query: undefined,
      //   // reqBody: {
      //   //   x
      //   // },
      // },
      headers: {
        'dogu-remote-device-job-id': key,
        'dogu-device-platform': 'android',
        'dogu-device-serial': 'ce0617162acaba2002',
        'dogu-request-timeout': '60000',
        'dogu-browser-name': 'chrome',
      },
    };

    const { organizationId, projectId, deviceId, deviceSerial, headers } = actionOption;
    const batchExecutor = new RemoteWebDriverBatchRequestExecutor(this.remoteWebDriverService, {
      organizationId,
      projectId,
      deviceId,
      deviceSerial,
      headers,
      parallel: true,
    });

    const getPageSource = new W3CGetPageSourceRemoteWebDriverBatchRequestItem(batchExecutor, sessionId);
    const takeScreenshot = new W3CTakeScreenshotRemoteWebDriverBatchRequestItem(batchExecutor, sessionId);
    // const appiumIsKeyboardShown = new AppiumIsKeyboardShownRemoteWebDriverBatchRequestItem(batchExecutor, sessionId);
    const findElement = new W3CFindElementRemoteWebDriverBatchRequestItem(
      batchExecutor,
      sessionId,
      'xpath',
      '/html/body/div[1]/section/section/header/div/div/div[2]/div[1]/a[1]/button',
    );
    await batchExecutor.execute();
    await takeScreenshot
      .response()
      .then(async (buffer) => {
        const putResult = await this.featureFileService.put({
          bucketKey: 'organization',
          key: `pk-remote-device-jobs/${key}/${toISOStringWithTimezone(new Date(), '-')}.png`,
          body: buffer,
          contentType: 'image/png',
        });
        this.logger.debug(`TEST: screenshot url: ${putResult.location}`);
      })
      .catch((error) => {
        this.logger.error(`TEST: screenshot error: ${stringify(error)}`);
      });
    await getPageSource
      .response()
      .then((pageSource) => {
        this.logger.debug(`TEST: pageSource size: ${pageSource.length}`);
      })
      .catch((error) => {
        this.logger.error(`TEST: pageSource error: ${stringify(error)}`);
      });
    // await appiumIsKeyboardShown
    //   .response()
    //   .then((isKeyboardShown) => {
    //     this.logger.debug(`TEST: isKeyboardShown: ${isKeyboardShown}`);
    //   })
    //   .catch((error) => {
    //     this.logger.error(`TEST: isKeyboardShown error: ${stringify(error)}`);
    //   });

    await findElement
      .response()
      .then(async (elementId) => {
        this.logger.debug(`TEST: findElement: ${stringify(elementId)}`);
        const batchExecutor = new RemoteWebDriverBatchRequestExecutor(this.remoteWebDriverService, {
          organizationId,
          projectId,
          deviceId,
          deviceSerial,
          headers,
          parallel: true,
        });
        const click = new W3CElementClickRemoteWebDriverBatchRequestItem(batchExecutor, sessionId, elementId);
        const sendKeys = new W3CElementSendKeysRemoteWebDriverBatchRequestItem(batchExecutor, sessionId, elementId, 'test');
        const performActions = new W3CPerformActionsRemoteWebDriverBatchRequestItem(batchExecutor, sessionId, []);
        const getTimeouts = new W3CGetTimeoutsRemoteWebDriverBatchRequestItem(batchExecutor, sessionId);
        await batchExecutor.execute();

        await click
          .response()
          .then(() => {
            this.logger.debug(`TEST: click`);
          })
          .catch((error) => {
            this.logger.error(`TEST: click error: ${stringify(error)}`);
          });
        await sendKeys
          .response()
          .then(() => {
            this.logger.debug(`TEST: sendKeys`);
          })
          .catch((error) => {
            this.logger.error(`TEST: sendKeys error: ${stringify(error)}`);
          });
        await performActions
          .response()
          .then(() => {
            this.logger.debug(`TEST: performActions`);
          })
          .catch((error) => {
            this.logger.error(`TEST: performActions error: ${stringify(error)}`);
          });
        await getTimeouts
          .response()
          .then((timeouts) => {
            this.logger.debug(`TEST: getTimeouts: ${stringify(timeouts)}`);
          })
          .catch((error) => {
            this.logger.error(`TEST: getTimeouts error: ${stringify(error)}`);
          });
      })
      .catch((error) => {
        this.logger.error(`TEST: findElement error: ${stringify(error)}`);
      });
  }

  //FIXME:(felix) test code
  async screenshotRecordTestStep_Test(): Promise<void> {
    const key = '60a38cc0-45d2-4b34-b819-38ef56958072';
    await this.newSessionTest('60a38cc0-45d2-4b34-b819-38ef56958071', true);
    const sessionId = await this.newSessionTest(key, false);

    // screenshot and Action
    // await this.screenshotAndActionTest1(key, sessionId);
    await this.screenshotAndActionTest2(key, sessionId);
    // await this.screenshotAndActionTest3(key, sessionId);
    // delete
    await this.deleteSessionTest(key, sessionId);
    return;
  }
}
