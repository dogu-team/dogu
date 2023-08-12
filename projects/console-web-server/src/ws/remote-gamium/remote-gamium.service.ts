import { DeviceId, DEVICE_TABLE_NAME, OrganizationId, ProjectId, REMOTE_TABLE_NAME, Serial } from '@dogu-private/types';
import { DefaultHttpOptions, DoguRequestTimeoutHeader, HeaderRecord, stringify } from '@dogu-tech/common';
import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Device } from '../../db/entity/device.entity';
import { RemoteDeviceJob } from '../../db/entity/remote-device-job.entity';
import { RemoteWebDriverInfo } from '../../db/entity/remote-webdriver-info.entity';
import { Remote } from '../../db/entity/remote.entity';
import { DeviceMessageRelayer } from '../../module/device-message/device-message.relayer';
import { DoguLogger } from '../../module/logger/logger';
import { DeviceStatusService } from '../../module/organization/device/device-status.service';
import { RemoteException } from '../../module/remote/common/exception';
import { RemoteDeviceJobProcessor } from '../../module/remote/processor/remote-device-job-processor';
import { RemoteWebDriverBatchRequestExecutor } from '../../module/remote/remote-webdriver/remote-webdriver.batch-request-executor';
import { RemoteWebDriverService } from '../../module/remote/remote-webdriver/remote-webdriver.service';
import { W3CGetWindowRectRemoteWebDriverBatchRequestItem } from '../../module/remote/remote-webdriver/remote-webdriver.w3c-batch-request-items';

@Injectable()
export class RemoteGamiumService {
  constructor(
    @Inject(forwardRef(() => DeviceStatusService))
    private readonly deviceStatusService: DeviceStatusService,
    @InjectDataSource()
    private readonly dataSource: DataSource, //
    @Inject(DeviceMessageRelayer)
    private readonly deviceMessageRelayer: DeviceMessageRelayer,

    private readonly logger: DoguLogger,
  ) {}

  async findDeviceJob(sessionId: string, port: number): Promise<{ device: Device; remote: Remote }> {
    const remoteDeviceJob = await this.dataSource.getRepository(RemoteDeviceJob).findOne({ where: { sessionId }, relations: [DEVICE_TABLE_NAME, REMOTE_TABLE_NAME] });
    if (!remoteDeviceJob) {
      throw new RemoteException(HttpStatus.NOT_FOUND, new Error(`Remote device job not found. sessionId: ${sessionId}`), {});
    }
    const remote = remoteDeviceJob.remote!;
    const remoteWdaInfo = await this.dataSource.getRepository(RemoteWebDriverInfo).findOne({ where: { remoteId: remote.remoteId } });
    if (!remoteWdaInfo) {
      throw new RemoteException(HttpStatus.NOT_FOUND, new Error(`Remote web driver info not found. remoteId: ${remote.remoteId}`), {});
    }

    await RemoteDeviceJobProcessor.setRemoteDeviceJobLastIntervalTime(this.dataSource.manager, remoteDeviceJob);
    const device = remoteDeviceJob.device!;
    return { device, remote };
  }

  async refreshCommandTimeout(
    remoteWebDriverService: RemoteWebDriverService,
    organizationId: OrganizationId,
    projectId: ProjectId,
    deviceId: DeviceId,
    deviceSerial: Serial,
    sessionId: string,
  ): Promise<void> {
    try {
      const headers: HeaderRecord = {};
      headers[DoguRequestTimeoutHeader] = DefaultHttpOptions.request.timeout1minutes.toString();
      const batchExecutor = new RemoteWebDriverBatchRequestExecutor(remoteWebDriverService, {
        organizationId,
        projectId,
        deviceId,
        deviceSerial,
        headers,
        parallel: true,
      });
      const item = new W3CGetWindowRectRemoteWebDriverBatchRequestItem(batchExecutor, sessionId);
      await batchExecutor.execute();

      await item.response().catch((error) => {
        this.logger.error(`RemoteGamiumService.refreshCommandTimeout: ${stringify(error)}`);
      });
    } catch (error) {
      this.logger.debug(`RemoteGamiumService.refreshCommandTimeout error: ${stringify(error)}`);
    }
  }
}
