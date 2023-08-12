import { ProfileMethod, RuntimeInfo, Serial } from '@dogu-private/types';
import { IosDeviceAgentService } from '../device-agent/ios-device-agent-service';
import { ProfileService } from './profile-service';

export class IosProfileService implements ProfileService {
  constructor(private readonly deviceAgentService: IosDeviceAgentService) {}

  async profile(serial: Serial, methods: ProfileMethod[]): Promise<Partial<RuntimeInfo>> {
    const res = await this.deviceAgentService.call('dcIdaQueryProfileParam', 'dcIdaQueryProfileResult', { profileMethods: methods });
    return res?.info ?? {};
  }
}
