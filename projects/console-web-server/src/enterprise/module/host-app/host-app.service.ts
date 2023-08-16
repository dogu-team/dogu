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
    // const app = latestApp.find((item) => item.platform === host.platform);
    const result = await this.deviceMessageRelayer.sendParam(organizationId, deviceId, {
      kind: 'RequestParam',
      value: {
        kind: 'UpdateHostAppRequest',
        url: 'https://github.com/dogu-team/dogu/releases/download/v1.7.0/dogu-agent-self-hosted-mac-arm64-1.7.0.zip',
        fileSize: 202_822_396,
      },
    });
  }
}
