// import { DEFAULT_SELF_HOSTED_LICENSE_TIER_DATA } from '@dogu-private/console';
import { DeviceConnectionState } from '@dogu-private/types';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import _ from 'lodash';
import { DataSource, EntityManager } from 'typeorm';

import { Device } from '../../../../db/entity/device.entity';
import { Organization, ProjectAndDevice } from '../../../../db/entity/index';
import { FEATURE_CONFIG } from '../../../../feature.config';
import { DoguLogger } from '../../../../module/logger/logger';
import { DeviceStatusService } from '../../../../module/organization/device/device-status.service';
import { SelfHostedLicenseService } from '../../license/self-hosted-license.service';

@Injectable()
export class LicenseUpdater {
  constructor(
    @InjectDataSource() //
    private readonly dataSource: DataSource,
    private readonly logger: DoguLogger,
    @Inject(SelfHostedLicenseService)
    private readonly selfHostedLicenseService: SelfHostedLicenseService,
  ) {}

  public async update(): Promise<void> {
    const functionsToCheck = [this.checkExpiredLicense.bind(this)];

    for (const checkFunction of functionsToCheck) {
      try {
        await checkFunction.call(this);
      } catch (error) {
        this.logger.error(error);
      }
    }
  }

  private async dropMobileDevices(manager: EntityManager, usingMobileDevices: Device[], enableMobileCount: number): Promise<void> {
    let dropDeviceCount = usingMobileDevices.length - enableMobileCount;
    const disConnectedMobileDevices = usingMobileDevices.filter((device) => {
      device.connectionState !== DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED;
    });

    const dropDevices = [];

    for (const device of disConnectedMobileDevices) {
      if (dropDeviceCount <= 0) {
        break;
      }

      if (device.isGlobal === 1) {
        await manager.getRepository(Device).update({ deviceId: device.deviceId }, { isGlobal: 0 });
      } else if (device.projectAndDevices && device.projectAndDevices.length > 0) {
        await manager.getRepository(ProjectAndDevice).softDelete({ deviceId: device.deviceId });
      }

      dropDevices.push(device);
      dropDeviceCount--;
    }

    const remainMobileDevices = _.difference(usingMobileDevices, dropDevices);

    if (dropDeviceCount > 0) {
      const sortedDeviceByUpdatedAt = remainMobileDevices.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
      for (const device of sortedDeviceByUpdatedAt) {
        if (dropDeviceCount <= 0) {
          break;
        }

        if (device.isGlobal === 1) {
          await manager.getRepository(Device).update({ deviceId: device.deviceId }, { isGlobal: 0 });
        } else if (device.projectAndDevices && device.projectAndDevices.length > 0) {
          await manager.getRepository(ProjectAndDevice).softDelete({ deviceId: device.deviceId });
        }
        dropDevices.push(device);
        dropDeviceCount--;
      }
    }
    return;
  }

  private async dropBrowserRunners(manager: EntityManager, usingHostDevices: Device[], enableBrowserCount: number): Promise<void> {
    const usingBrowserRunnerCount = usingHostDevices.map((device) => device.maxParallelJobs).reduce((a, b) => a + b, 0);

    let dropRunnerCount = usingBrowserRunnerCount - enableBrowserCount;
    const disConnectedHostDevices = usingHostDevices.filter((device) => {
      device.connectionState !== DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED;
    });

    const dropDevices = [];

    for (const device of disConnectedHostDevices) {
      if (dropRunnerCount <= 0) {
        break;
      }

      if (device.isGlobal === 1) {
        await manager.getRepository(Device).update({ deviceId: device.deviceId }, { isGlobal: 0 });
      } else if (device.projectAndDevices && device.projectAndDevices.length > 0) {
        await manager.getRepository(ProjectAndDevice).softDelete({ deviceId: device.deviceId });
      }
      dropRunnerCount = dropRunnerCount - device.maxParallelJobs;

      dropDevices.push(device);
    }

    const remainHostDevices = _.difference(usingHostDevices, dropDevices);

    if (dropRunnerCount > 0) {
      const sortedDeviceByUpdatedAt = remainHostDevices.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
      for (const device of sortedDeviceByUpdatedAt) {
        if (dropRunnerCount <= 0) {
          break;
        }

        if (device.isGlobal === 1) {
          await manager.getRepository(Device).update({ deviceId: device.deviceId }, { isGlobal: 0 });
        } else if (device.projectAndDevices && device.projectAndDevices.length > 0) {
          await manager.getRepository(ProjectAndDevice).softDelete({ deviceId: device.deviceId });
        }
        dropRunnerCount = dropRunnerCount - device.maxParallelJobs;

        dropDevices.push(device);
      }
    }
    return;
  }

  private async checkExpiredSelfHostedLicense(): Promise<void> {
    const rootOrganization = await this.dataSource.getRepository(Organization).createQueryBuilder('organization').orderBy('organization.createdAt', 'ASC').getOne();

    if (!rootOrganization) {
      this.logger.error('checkExpiredSelfHostedLicense Cannot find organization in server');
      throw new NotFoundException(`Cannot find organization in server`);
    }

    const license = await this.selfHostedLicenseService.getLicenseInfo(rootOrganization.organizationId);

    await this.dataSource.manager.transaction(async (manager) => {
      const hostDevices = await DeviceStatusService.findEnabledHostDevices(manager, rootOrganization.organizationId);
      const usingBrowserRunnerCount = hostDevices.map((device) => device.maxParallelJobs).reduce((a, b) => a + b, 0);

      if (license.maximumEnabledBrowserCount < usingBrowserRunnerCount) {
        await this.dropBrowserRunners(manager, hostDevices, license.maximumEnabledBrowserCount);
      }
      const mobildDevices = await DeviceStatusService.findEnabledMobileDevices(manager, rootOrganization.organizationId);

      if (license.maximumEnabledMobileCount < mobildDevices.length) {
        await this.dropMobileDevices(manager, mobildDevices, license.maximumEnabledMobileCount);
      }
    });
  }

  private async checkExpiredLicense(): Promise<void> {
    if (FEATURE_CONFIG.get('licenseModule') === 'self-hosted') {
      await this.checkExpiredSelfHostedLicense();
    }
  }
}
