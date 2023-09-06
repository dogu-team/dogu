import { ProfileMethod, ProfileMethodKind, RuntimeInfo, Serial } from '@dogu-private/types';
import { IosDeviceAgentProcess } from '../../externals/cli/ios-device-agent';
import { IosDeviceAgentService } from '../device-agent/ios-device-agent-service';
import { ProfileService } from './profile-service';

export class IosProfileService implements ProfileService {
  constructor(private readonly deviceAgentService: IosDeviceAgentService) {}

  async profile(serial: Serial, methods: ProfileMethod[]): Promise<Partial<RuntimeInfo>> {
    const res = await this.deviceAgentService.call('dcIdaQueryProfileParam', 'dcIdaQueryProfileResult', { profileMethods: methods });
    return res?.info ?? {};
  }
}

export class IosDisplayProfileService implements ProfileService {
  constructor(private readonly deviceAgent: IosDeviceAgentProcess) {}

  async profile(serial: Serial, methods: ProfileMethod[]): Promise<Partial<RuntimeInfo>> {
    const isIncludeType = methods.some((method) => method.kind === ProfileMethodKind.PROFILE_METHOD_KIND_IOS_DISPLAY);
    if (!isIncludeType) {
      return {};
    }
    return Promise.resolve({ displays: [{ name: 'default', isScreenOn: true, error: this.deviceAgent.error() }] });
  }
}
