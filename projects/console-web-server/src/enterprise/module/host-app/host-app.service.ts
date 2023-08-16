import { platformArchitectureFromDownloadablePackageResult } from '@dogu-private/console';
import { HostId, OrganizationId } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { DeviceMessageRelayer } from '../../../module/device-message/device-message.relayer';
import { DownloadService } from '../../../module/download/download.service';
import { HostService } from '../../../module/organization/host/host.service';

@Injectable()
export class HostAppService {
  constructor(private readonly hostService: HostService, private readonly downloadService: DownloadService, private readonly deviceMessageRelayer: DeviceMessageRelayer) {}

  async update(organizationId: OrganizationId, hostId: HostId): Promise<void> {
    const host = await this.hostService.findHost(hostId);
    const hostDevice = host.hostDevice;
    if (!hostDevice) {
      throw new Error('host device not found');
    }
    const deviceId = hostDevice?.deviceId;
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
