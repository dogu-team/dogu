import { RecordTestStepBase, RecordTestStepPropCamel, RecordTestStepPropSnake } from '@dogu-private/console';
import { DeviceId, OrganizationId, ProjectId, RecordTestStepId } from '@dogu-private/types';
import {
  DefaultHttpOptions,
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
  stringify,
  toISOStringWithTimezone,
} from '@dogu-tech/common';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
import { RecordTestStep } from '../../../../db/entity/record-test-step.entity';
import { EMPTY_PAGE, Page } from '../../../../module/common/dto/pagination/page';
import { FeatureFileService } from '../../../../module/feature/file/feature-file.service';
import { DoguLogger } from '../../../../module/logger/logger';
import { WebDriverEndpointHandlerResult } from '../../../../module/remote/common/type';
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
  W3CPerformActionsRemoteWebDriverBatchRequestItem,
  W3CTakeScreenshotRemoteWebDriverBatchRequestItem,
} from '../../../../module/remote/remote-webdriver/remote-webdriver.w3c-batch-request-items';
import { CreateRecordTestStepDto, FindRecordTestStepsByProjectIdDto, UpdateRecordTestStepDto } from '../dto/record-test-step.dto';

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

  async findRecordTestStepsByProjectId(projectId: ProjectId, dto: FindRecordTestStepsByProjectIdDto): Promise<Page<RecordTestStepBase>> {
    const rv = await this.dataSource
      .getRepository(RecordTestStep) //
      .createQueryBuilder('recordTestStep')
      .where(`recordTestStep.${RecordTestStepPropCamel.projectId} = :${RecordTestStepPropCamel.projectId}`, { projectId })
      .andWhere(`recordTestStep.${RecordTestStepPropCamel.name} ILIKE :${RecordTestStepPropCamel.name}`, { name: `%${dto.keyword}%` })
      .orderBy(`recordTestStep.${RecordTestStepPropCamel.updatedAt}`, 'DESC')
      .limit(dto.getDBLimit())
      .offset(dto.getDBOffset())
      .getManyAndCount();

    const data = rv[0];
    const totalCount = rv[1];

    if (data.length === 0) {
      return EMPTY_PAGE;
    }

    const page = new Page<RecordTestStepBase>(dto.page, dto.offset, totalCount, data);
    return page;
  }

  async findRecordTestStepById(projectId: ProjectId, recordTestStepId: RecordTestStepId): Promise<RecordTestStepBase> {
    const recordTestStep = await this.dataSource
      .getRepository(RecordTestStep) //
      .createQueryBuilder('recordTestStep')
      .where(`recordTestStep.${RecordTestStepPropSnake.project_id} = :${RecordTestStepPropCamel.projectId}`, { projectId })
      .andWhere(`recordTestStep.${RecordTestStepPropSnake.record_test_step_id} = :recordTestStepId`, { recordTestStepId })
      .getOne();

    if (!recordTestStep) {
      throw new HttpException(`RecordTestStep not found. recordTestStepId: ${recordTestStepId}`, HttpStatus.NOT_FOUND);
    }

    return recordTestStep;
  }

  async createRecordTestStep(projectId: ProjectId, dto: CreateRecordTestStepDto): Promise<RecordTestStepBase> {
    const { name } = dto;
    const newData = this.dataSource.getRepository(RecordTestStep).create({
      recordTestStepId: v4(),
      projectId,
      name,
    });

    const recordTestStep = await this.dataSource.getRepository(RecordTestStep).save(newData);
    return recordTestStep;
  }

  async updateRecordTestStep(projectId: ProjectId, recordTestStepId: RecordTestStepId, dto: UpdateRecordTestStepDto): Promise<RecordTestStepBase> {
    const { name } = dto;
    const data = await this.dataSource.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestStepId } });
    if (!data) {
      throw new HttpException(`RecordTestStep not found. recordTestStepId: ${recordTestStepId}`, HttpStatus.NOT_FOUND);
    }

    if (data.name === name) {
      throw new HttpException(`RecordTestStep name is same. name: ${name}`, HttpStatus.BAD_REQUEST);
    }

    data.name = name;
    const rv = await this.dataSource.getRepository(RecordTestStep).save(data);
    return rv;
  }

  async deleteRecordTestStep(projectId: ProjectId, recordTestStepId: RecordTestStepId): Promise<void> {
    const testStep = await this.dataSource.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestStepId } });
    if (!testStep) {
      throw new HttpException(`RecordTestStep not found. recordTestStepId: ${recordTestStepId}`, HttpStatus.NOT_FOUND);
    }

    // FIXME: join data
    await this.dataSource.getRepository(RecordTestStep).softRemove(testStep);
  }

  async addAction(organizationId: OrganizationId, projectId: ProjectId, deviceId: DeviceId, dto: object) {
    const key = v4();
    // const { screenSize, screenPosition } = dto;
    // pageSource = getPageSource()

    // document = parse(pageSource)
    // element = find(document, screenSize, screenPosition)

    // new session

    // screenShot = takeScreenshot()

    // action
    // elementId = findElement(element -> xpath)
    // elementClick(elementId)
  }

  async newSession(organizationId: OrganizationId, projectId: ProjectId, deviceId: DeviceId, key: string): Promise<string> {
    // 웹, app

    return '';
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

    const sessionId = await newSessionResponse.response();
    return sessionId;
  }

  //FIXME:(felix) test code
  async newSessionTest(key: string): Promise<string> {
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

    const newSessionResponse = new NewSessionRemoteWebDriverBatchRequestItem(batchExecutor, {});
    await batchExecutor.execute();

    const sessionId = await newSessionResponse.response();
    return sessionId;
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
    const findElement = new W3CFindElementRemoteWebDriverBatchRequestItem(batchExecutor, sessionId, 'xpath', '/html/body/div[2]/header/div[4]/div/div/div[1]/a');
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
    const sessionId = await this.newSessionTest(key);

    // screenshot and Action
    // await this.screenshotAndActionTest1(key, sessionId);
    // await this.screenshotAndActionTest2(key, sessionId);
    await this.screenshotAndActionTest3(key, sessionId);
    // delete
    await this.deleteSessionTest(key, sessionId);
    return;
  }

  //FIXME:(felix) test code
  private setHeaders(headers: HeaderRecord, processResult: WebDriverEndpointHandlerResult): void {
    headers[DoguRemoteDeviceJobIdHeader] = processResult.remoteDeviceJobId;
    headers[DoguDevicePlatformHeader] = processResult.devicePlatform;
    headers[DoguDeviceSerialHeader] = processResult.deviceSerial;
    headers[DoguRequestTimeoutHeader] = DefaultHttpOptions.request.timeout3minutes.toString();
    if (processResult.applicationUrl) headers[DoguApplicationUrlHeader] = processResult.applicationUrl;
    if (processResult.applicationVersion) headers[DoguApplicationVersionHeader] = processResult.applicationVersion;
    if (processResult.applicationFileSize) headers[DoguApplicationFileSizeHeader] = processResult.applicationFileSize.toString();
    if (processResult.browserName) headers[DoguBrowserNameHeader] = processResult.browserName;
    if (processResult.browserVersion) headers[DoguBrowserVersionHeader] = processResult.browserVersion;
  }
}
