import { AndroidNodeAttributes, getDevicePositionByVideoPosition, IosNodeAttributes, NodeUtilizer, ParsedNode } from '@dogu-private/console';
import { AndroidNodeUtilizer } from '@dogu-private/console/src/util/page-source/android';
import { GamiumNodeUtilizer } from '@dogu-private/console/src/util/page-source/gamium';
import { IosNodeUtilizer } from '@dogu-private/console/src/util/page-source/ios';
import { Platform } from '@dogu-private/types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import { Device } from '../../../../db/entity/device.entity';
import { RecordTestCase } from '../../../../db/entity/record-test-case.entity';
import { RecordTestStepActionWebdriverClick } from '../../../../db/entity/record-test-step-action-webdriver-click.entity';
import { RecordTestStep } from '../../../../db/entity/record-test-step.entity';
import { RemoteWebDriverBatchRequestExecutor } from '../../../../module/remote/remote-webdriver/remote-webdriver.batch-request-executor';
import {
  W3CElementClickRemoteWebDriverBatchRequestItem,
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

    const boundX = bound.x;
    const boundY = bound.y;
    const boundWidth = bound.width;
    const boundHeight = bound.height;
    const xpath = clickableTopNode.attributes.path;
    if (!xpath) {
      throw new HttpException(`No xpath found`, HttpStatus.NOT_FOUND);
    }

    const newData = manager.getRepository(RecordTestStepActionWebdriverClick).create({
      recordTestStepActionWebdriverClickId: v4(),
      recordTestStepId: recordTestStep.recordTestStepId,
      deviceScreenSizeX: deviceScreenSize.width,
      deviceScreenSizeY: deviceScreenSize.height,
      xpath,
      boundX,
      boundY,
      boundWidth,
      boundHeight,
    });

    await manager.getRepository(RecordTestStepActionWebdriverClick).save(newData);

    const findElExecutor = batchExecutor.new({ parallel: false });
    const findElement = new W3CFindElementRemoteWebDriverBatchRequestItem(findElExecutor, recordTestCase.activeSessionId!, 'xpath', xpath);
    await findElExecutor.execute();

    const elId = await findElement.response();
    const clickExecutor = batchExecutor.new({ parallel: false });
    const click = new W3CElementClickRemoteWebDriverBatchRequestItem(clickExecutor, recordTestCase.activeSessionId!, elId);

    await clickExecutor.execute();
    await click.response();
  }

  public async runWebdriverClickAction() {}
}
