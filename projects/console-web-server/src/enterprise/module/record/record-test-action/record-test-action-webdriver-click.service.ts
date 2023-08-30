import {
  AndroidNodeAttributes,
  getDevicePositionByVideoPosition,
  IosNodeAttributes,
  NodeUtilizer,
  ParsedNode,
  RecordTestStepActionClick,
  RecordTestStepActionInput,
} from '@dogu-private/console';
import { AndroidNodeUtilizer } from '@dogu-private/console/src/util/page-source/android';
import { GamiumNodeUtilizer } from '@dogu-private/console/src/util/page-source/gamium';
import { IosNodeUtilizer } from '@dogu-private/console/src/util/page-source/ios';
import { Platform } from '@dogu-private/types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { Device } from '../../../../db/entity/device.entity';
import { RecordTestCase } from '../../../../db/entity/record-test-case.entity';
import { RecordTestStep } from '../../../../db/entity/record-test-step.entity';
import { AppiumIsKeyboardShownRemoteWebDriverBatchRequestItem } from '../../../../module/remote/remote-webdriver/remote-webdriver.appium-batch-request-items';
import { RemoteWebDriverBatchRequestExecutor } from '../../../../module/remote/remote-webdriver/remote-webdriver.batch-request-executor';
import {
  W3CElementClickRemoteWebDriverBatchRequestItem,
  W3CElementSendKeysRemoteWebDriverBatchRequestItem,
  W3CFindElementRemoteWebDriverBatchRequestItem,
} from '../../../../module/remote/remote-webdriver/remote-webdriver.w3c-batch-request-items';
import { CreateRecordTestStepDto } from '../dto/record-test-step.dto';

@Injectable()
export class RecordTestStepActionWebdriverClickService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  public async addWebdriverClickAction(
    manager: EntityManager,
    recordTestCase: RecordTestCase,
    recordTestStep: RecordTestStep,
    device: Device,
    utilizer: GamiumNodeUtilizer | AndroidNodeUtilizer | IosNodeUtilizer,
    batchExecutor: RemoteWebDriverBatchRequestExecutor,
    dto: CreateRecordTestStepDto,
  ): Promise<void> {
    if (dto.actionInfo.type !== 'WEBDRIVER_CLICK') {
      throw new HttpException(`Invalid action type: ${dto.actionInfo.type}`, HttpStatus.BAD_REQUEST);
    }
    const { videoScreenSizeX, videoScreenSizeY, videoScreenPositionX, videoScreenPositionY } = dto.actionInfo;
    const deviceScreenSize = {
      width: recordTestCase.activeDeviceScreenSizeX!,
      height: recordTestCase.activeDeviceScreenSizeY!,
    };
    const videoScreenSize = {
      width: videoScreenSizeX,
      height: videoScreenSizeY,
    };
    const devicePosision = getDevicePositionByVideoPosition(deviceScreenSize, videoScreenSize, videoScreenPositionX, videoScreenPositionY);
    let clickableTopNode;
    let bound;
    if (device.platform === Platform.PLATFORM_ANDROID) {
      if (utilizer.constructor.name === 'AndroidNodeUtilizer') {
        const targetedNodes = (utilizer as AndroidNodeUtilizer).getNodesByPosition(devicePosision.x, devicePosision.y) as ParsedNode<AndroidNodeAttributes>[];
        clickableTopNode = targetedNodes.find((n: ParsedNode<AndroidNodeAttributes>) => n.attributes.clickable === true) as ParsedNode<AndroidNodeAttributes>;
        bound = (utilizer as AndroidNodeUtilizer).getNodeBound(clickableTopNode);
      } else {
        throw new Error('Not implemented yet');
      }
    } else if (device.platform === Platform.PLATFORM_IOS) {
      if (utilizer instanceof NodeUtilizer<IosNodeAttributes>) {
        throw new Error('Not implemented yet');
      } else {
        throw new Error('Not implemented yet');
      }
    } else {
      throw new Error('Not implemented yet');
    }
    if (!clickableTopNode) {
      throw new HttpException(`No clickable node found`, HttpStatus.NOT_FOUND);
    }
    const xpath = clickableTopNode.attributes.path;
    if (!xpath) {
      throw new HttpException(`No xpath found`, HttpStatus.NOT_FOUND);
    }
    const recordTestActionClickData: RecordTestStepActionClick = {
      type: recordTestStep.type,
      deviceScreenSizeX: deviceScreenSize.width,
      deviceScreenSizeY: deviceScreenSize.height,
      xpath,
      boundX: bound.x,
      boundY: bound.y,
      boundWidth: bound.width,
      boundHeight: bound.height,
    };

    const updateRecordTestStep = { ...recordTestStep, ...recordTestActionClickData };

    await manager.getRepository(RecordTestStep).save(updateRecordTestStep);

    const findElExecutor = batchExecutor.new({ parallel: false });
    const findElement = new W3CFindElementRemoteWebDriverBatchRequestItem(findElExecutor, recordTestCase.activeSessionId!, 'xpath', xpath);
    await findElExecutor.execute();
    const elId = await findElement.response();
    const clickExecutor = batchExecutor.new({ parallel: false });
    const click = new W3CElementClickRemoteWebDriverBatchRequestItem(clickExecutor, recordTestCase.activeSessionId!, elId);
    await clickExecutor.execute();
    await click.response();
  }

  public async addWebdriverClickAction_TEST(
    manager: EntityManager,
    recordTestCase: RecordTestCase,
    recordTestStep: RecordTestStep,
    device: Device,
    utilizer: GamiumNodeUtilizer | AndroidNodeUtilizer | IosNodeUtilizer,
    batchExecutor: RemoteWebDriverBatchRequestExecutor,
    dto: CreateRecordTestStepDto,
  ): Promise<void> {
    if (dto.actionInfo.type !== 'WEBDRIVER_CLICK') {
      throw new HttpException(`Invalid action type: ${dto.actionInfo.type}`, HttpStatus.BAD_REQUEST);
    }

    const deviceScreenSize = {
      width: recordTestCase.activeDeviceScreenSizeX!,
      height: recordTestCase.activeDeviceScreenSizeY!,
    };

    let focusedNode;
    if (device.platform === Platform.PLATFORM_ANDROID) {
      if (utilizer.constructor.name === 'AndroidNodeUtilizer') {
        focusedNode = (utilizer as AndroidNodeUtilizer).getFocusedNode() as ParsedNode<AndroidNodeAttributes>;
      } else {
        throw new Error('Not implemented yet');
      }
    } else if (device.platform === Platform.PLATFORM_IOS) {
      if (utilizer instanceof NodeUtilizer<IosNodeAttributes>) {
        throw new Error('Not implemented yet');
      } else {
        throw new Error('Not implemented yet');
      }
    } else {
      throw new Error('Not implemented yet');
    }
    if (!focusedNode) {
      throw new HttpException(`No clickable node found`, HttpStatus.NOT_FOUND);
    }

    const bound = (utilizer as AndroidNodeUtilizer).getNodeBound(focusedNode);
    const xpath = focusedNode.attributes.path;
    if (!xpath) {
      throw new HttpException(`No xpath found`, HttpStatus.NOT_FOUND);
    }

    const recordTestActionInputData: RecordTestStepActionInput = {
      type: recordTestStep.type,
      deviceScreenSizeX: deviceScreenSize.width,
      deviceScreenSizeY: deviceScreenSize.height,
      xpath,
      value: 'test',
      boundX: bound.x,
      boundY: bound.y,
      boundWidth: bound.width,
      boundHeight: bound.height,
    };

    const updateRecordTestStep = { ...recordTestStep, ...recordTestActionInputData };
    await manager.getRepository(RecordTestStep).save(updateRecordTestStep);

    const findExcutor = batchExecutor.new({ parallel: false });
    const appiumIsKeyboardShown = new AppiumIsKeyboardShownRemoteWebDriverBatchRequestItem(findExcutor, recordTestCase.activeSessionId!);
    const findElement = new W3CFindElementRemoteWebDriverBatchRequestItem(findExcutor, recordTestCase.activeSessionId!, 'xpath', focusedNode.key);
    await findExcutor.execute();

    const isKeyboardShown = await appiumIsKeyboardShown.response();
    if (!isKeyboardShown) {
      throw new HttpException(`Keyboard is not shown`, HttpStatus.NOT_FOUND);
    }

    const elId = await findElement.response();

    const inputSendExecutor = batchExecutor.new({ parallel: false });
    const sendKeys = new W3CElementSendKeysRemoteWebDriverBatchRequestItem(inputSendExecutor, recordTestCase.activeSessionId!, elId, 'test');

    await inputSendExecutor.execute();
  }
}
