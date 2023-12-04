import { DeviceConnectionState, HostConnectionState, HostId, OrganizationId, platformArchitectureFromDownloadablePackageResult } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { Device } from '../../../db/entity/device.entity';
import { Host } from '../../../db/entity/host.entity';
import { DeviceMessageRelayer } from '../../../module/device-message/device-message.relayer';
import { DownloadService } from '../../../module/download/download.service';
import { HostService } from '../../../module/organization/host/host.service';

@Injectable()
export class HostAppService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly hostService: HostService,
    private readonly downloadService: DownloadService,
    private readonly deviceMessageRelayer: DeviceMessageRelayer,
  ) {}

  async updateAllIdleHost(): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const hosts = await manager.getRepository(Host).find({});
      for (const host of hosts) {
        if (host.connectionState !== HostConnectionState.HOST_CONNECTION_STATE_CONNECTED) {
          continue;
        }
        if (!(await this.hostService.isHostIdle(manager, host.hostId))) {
          continue;
        }
        await this.updateInternal(manager, host.organizationId, host.hostId);
      }
    });
  }

  async update(organizationId: OrganizationId, hostId: HostId): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await this.updateInternal(manager, organizationId, hostId);
    });
  }

  private async updateInternal(manager: EntityManager, organizationId: OrganizationId, hostId: HostId): Promise<void> {
    const host = await manager.getRepository(Host).findOne({ where: { hostId, connectionState: HostConnectionState.HOST_CONNECTION_STATE_CONNECTED } });
    if (!host) {
      throw new Error('host not found');
    }

    const anyDevice = await manager.getRepository(Device).findOne({ where: { hostId, connectionState: DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED } });
    if (!anyDevice) {
      throw new Error("host's device not found");
    }
    const deviceId = anyDevice?.deviceId;
    const latestApp = await this.downloadService.getDoguAgentLatest();
    const app = latestApp.find((item) => {
      const { platform, architecture } = platformArchitectureFromDownloadablePackageResult(item);
      return platform === host.platform && architecture === host.architecture;
    });
    if (!app) {
      throw new Error('updatable app not found');
    }
    const result = await this.deviceMessageRelayer.sendParam(organizationId, deviceId, {
      kind: 'RequestParam',
      value: {
        kind: 'UpdateHostAppRequest',
        url: app.url,
        fileSize: app.size,
      },
    });
    if (result.value.kind === 'ErrorResult') {
      throw new Error(`update host app failed: ${result.value.value.message}`);
    }
  }
}
