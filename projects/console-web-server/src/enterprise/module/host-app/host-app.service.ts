import { HostId, OrganizationId } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { DeviceMessageRelayer } from '../../../module/device-message/device-message.relayer';
import { HostService } from '../../../module/organization/host/host.service';

@Injectable()
export class HostAppService {
  constructor(private readonly hostService: HostService, private readonly deviceMessageRelayer: DeviceMessageRelayer) {}

  async test(organizationId: OrganizationId, hostId: HostId): Promise<void> {
    const deviceId = await this.hostService.findHostDeviceId(hostId);
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
