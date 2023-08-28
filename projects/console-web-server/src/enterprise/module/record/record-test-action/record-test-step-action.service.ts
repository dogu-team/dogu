import { ContextNode, NodeAttributes, NodeUtilizerFactory, PageSourceParserFacade } from '@dogu-private/console';
import { RecordTestStepAction } from '@dogu-private/console/src/base/record-test-action';
import { OrganizationId, Platform, ProjectId, RECORD_TEST_STEP_ACTION_TYPE } from '@dogu-private/types';
import { ScreenSize } from '@dogu-tech/device-client-common';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Device } from '../../../../db/entity/device.entity';
import { RecordTestCase } from '../../../../db/entity/record-test-case.entity';
import { RecordTestStepActionWebdriverClick } from '../../../../db/entity/record-test-step-action-webdriver-click.entity';
import { RecordTestStep } from '../../../../db/entity/record-test-step.entity';
import { ProjectFileService } from '../../../../module/file/project-file.service';
import { DoguLogger } from '../../../../module/logger/logger';
import {
  AppiumGetContextsRemoteWebDriverBatchRequestItem,
  AppiumGetSystemBarsRemoteWebDriverBatchRequestItem,
  AppiumSetContextRemoteWebDriverBatchRequestItem,
} from '../../../../module/remote/remote-webdriver/remote-webdriver.appium-batch-request-items';
import { RemoteWebDriverBatchRequestExecutor } from '../../../../module/remote/remote-webdriver/remote-webdriver.batch-request-executor';
import { RemoteWebDriverService } from '../../../../module/remote/remote-webdriver/remote-webdriver.service';
import {
  W3CGetPageSourceRemoteWebDriverBatchRequestItem,
  W3CTakeScreenshotRemoteWebDriverBatchRequestItem,
} from '../../../../module/remote/remote-webdriver/remote-webdriver.w3c-batch-request-items';
import { makeActionBatchExcutor } from '../common';
import { CreateRecordTestStepDto } from '../dto/record-test-step.dto';
import { RecordTestStepActionWebdriverClickService } from './record-test-action-webdriver-click.service';
import { RecordTestStepActionWebdriverInputService } from './record-test-action-webdriver-input.service';

@Injectable()
export class RecordTestStepActionService {
  constructor(
    @Inject(RemoteWebDriverService)
    private readonly remoteWebDriverService: RemoteWebDriverService,
    @Inject(ProjectFileService)
    private readonly projectFileService: ProjectFileService,
    @Inject(RecordTestStepActionWebdriverClickService)
    private readonly recordTestStepActionWebdriverClickService: RecordTestStepActionWebdriverClickService,
    @Inject(RecordTestStepActionWebdriverInputService)
    private readonly recordTestStepActionWebdriverInputService: RecordTestStepActionWebdriverInputService,

    private readonly logger: DoguLogger,
  ) {}

  async addAction(manager: EntityManager, organizationId: OrganizationId, projectId: ProjectId, recordTestStep: RecordTestStep, dto: CreateRecordTestStepDto): Promise<void> {
    const actionData = dto.actionInfo;
    const { type } = actionData;
    const { recordTestCaseId } = recordTestStep;

    const recordTestCase = await manager.getRepository(RecordTestCase).findOne({ where: { recordTestCaseId } });
    if (!recordTestCase) {
      throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }
    const activeDeviceId = recordTestCase.activeDeviceId;
    if (!activeDeviceId) {
      throw new HttpException(`Device does not have activeDeviceId. RecordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }
    const device = await manager.getRepository(Device).findOne({ where: { organizationId, deviceId: activeDeviceId } });
    if (!device) {
      throw new HttpException(`Device not found. activeDeviceId: ${recordTestCase.activeDeviceId}`, HttpStatus.NOT_FOUND);
    }
    const batchExecutor: RemoteWebDriverBatchRequestExecutor = makeActionBatchExcutor(this.remoteWebDriverService, organizationId, projectId, recordTestCase, device);

    const activeSessionId = recordTestCase.activeSessionId;
    if (!activeSessionId) {
      throw new HttpException(`Device does not have activeSessionId. RecordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }

    const takeScreenshot = new W3CTakeScreenshotRemoteWebDriverBatchRequestItem(batchExecutor, activeSessionId);
    const appiumGetContexts = new AppiumGetContextsRemoteWebDriverBatchRequestItem(batchExecutor, activeSessionId);
    const appiumGetSystemBars = new AppiumGetSystemBarsRemoteWebDriverBatchRequestItem(batchExecutor, activeSessionId);
    await batchExecutor.execute();

    const contexts = await appiumGetContexts.response();

    let convertedResult: { contextInfo: Pick<ContextNode<NodeAttributes>, 'context' | 'node'>; pageSource: string }[] = [];
    for (const context of contexts) {
      const subExecutor = batchExecutor.new({ parallel: false });
      const appiumSetContext = new AppiumSetContextRemoteWebDriverBatchRequestItem(subExecutor, activeSessionId, context);
      const w3cGetPageSource = new W3CGetPageSourceRemoteWebDriverBatchRequestItem(subExecutor, activeSessionId);
      await subExecutor.execute();
      await appiumSetContext.response();
      const pageSource = await w3cGetPageSource.response();
      convertedResult.push({ contextInfo: { context, node: new PageSourceParserFacade().parse(device.platform, pageSource) }, pageSource });
    }

    const nativeAppContextInfo = convertedResult.find((r) => r.contextInfo.context === 'NATIVE_APP');
    if (!nativeAppContextInfo) {
      throw new HttpException(`NATIVE_APP context not found.`, HttpStatus.NOT_FOUND);
    }

    const screenSize: ScreenSize = { width: recordTestCase.activeDeviceScreenSizeX!, height: recordTestCase.activeDeviceScreenSizeY! };
    const systemBars = await appiumGetSystemBars.response();

    const utilizer = NodeUtilizerFactory.create(device.platform, {
      ...nativeAppContextInfo.contextInfo,
      screenSize,
      android: device.platform === Platform.PLATFORM_ANDROID ? { statusBar: systemBars.statusBar, navigationBar: systemBars.navigationBar } : undefined,
    });

    const screenshotBuffer = await takeScreenshot.response();
    await this.projectFileService.uploadRecordTestScreenshot(screenshotBuffer, organizationId, projectId, recordTestCaseId, recordTestStep.recordTestStepId);
    await this.projectFileService.uploadRecordTestPageSource(nativeAppContextInfo.pageSource, organizationId, projectId, recordTestCaseId, recordTestStep.recordTestStepId);

    await manager.getRepository(RecordTestStep).save(recordTestStep);

    switch (type) {
      case 'WEBDRIVER_CLICK':
        await this.recordTestStepActionWebdriverClickService.addWebdriverClickAction(manager, recordTestCase, recordTestStep, device, utilizer, batchExecutor, dto);
        break;
      case 'WEBDRIVER_INPUT':
        await this.recordTestStepActionWebdriverInputService.addWebdriverInputAction(manager, recordTestCase, recordTestStep, device, utilizer, batchExecutor, dto);
        break;
      // case RECORD_TEST_STEP_ACTION_TYPE.UNSPECIFIED:
      //   break;
      default:
        const _exhaustiveCheck: never = type;
        throw new HttpException(`Unknown action type: ${type}`, HttpStatus.BAD_REQUEST);
    }
  }

  async getRecordTestStepAction(manager: EntityManager, recordTestStep: RecordTestStep): Promise<RecordTestStepAction> {
    let action = null;
    switch (recordTestStep.type) {
      case RECORD_TEST_STEP_ACTION_TYPE.WEBDRIVER_CLICK:
        action = await manager.getRepository(RecordTestStepActionWebdriverClick).findOne({
          where: { recordTestStepId: recordTestStep.recordTestStepId },
        });
        break;
      case RECORD_TEST_STEP_ACTION_TYPE.WEBDRIVER_INPUT:
        break;
      case RECORD_TEST_STEP_ACTION_TYPE.UNSPECIFIED:
        break;
      default:
        const _exhaustiveCheck: never = recordTestStep.type;
        throw new HttpException(`RecordTestStep type is invalid. type: ${recordTestStep.type}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!action) {
      throw new HttpException(`RecordTestStepAction not found. recordTestStepId: ${recordTestStep.recordTestStepId}`, HttpStatus.NOT_FOUND);
    }

    return action;
  }

  async softDeleteRecordTestStepAction(manager: EntityManager, recordTestStep: RecordTestStep): Promise<void> {
    switch (recordTestStep.type) {
      case RECORD_TEST_STEP_ACTION_TYPE.WEBDRIVER_CLICK:
        await this.recordTestStepActionWebdriverClickService.softDeleteRecordTestStepWebdriverClickAction(manager, recordTestStep);
        break;
      case RECORD_TEST_STEP_ACTION_TYPE.WEBDRIVER_INPUT:
        await this.recordTestStepActionWebdriverInputService.softDeleteRecordTestStepWebdriverInputAction(manager, recordTestStep);
        break;
      case RECORD_TEST_STEP_ACTION_TYPE.UNSPECIFIED:
        break;
      default:
        const _exhaustiveCheck: never = recordTestStep.type;
        throw new HttpException(`RecordTestStep type is invalid. type: ${recordTestStep.type}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
