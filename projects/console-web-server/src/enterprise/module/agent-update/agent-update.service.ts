import { Injectable } from '@nestjs/common';
import { DeviceMessageRelayer } from '../../../module/device-message/device-message.relayer';

@Injectable()
export class AgentUpdateService {
  constructor(private readonly deviceMessageRelayer: DeviceMessageRelayer) {}

  async send(): Pronise<void> {
    const result = await this.deviceMessageRelayer.sendParam(organizationId, deviceId, {
      kind: 'UpdateAgentRequest',
      url: '',
    });
  }
}
