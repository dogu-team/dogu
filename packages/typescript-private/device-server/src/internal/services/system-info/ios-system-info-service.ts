import { DefaultDeviceSystemInfo, DeviceSystemInfo, Serial } from '@dogu-private/types';
import { idcLogger } from '../../../logger/logger.instance';
import { MobileDevice } from '../../externals';
import { IosDeviceAgentService } from '../device-agent/ios-device-agent-service';
import { SystemInfoService } from './system-info-service-interface';

export class IosSystemInfoService implements SystemInfoService {
  constructor(private readonly service: IosDeviceAgentService) {}

  static async getVersion(serial: Serial): Promise<string | undefined> {
    return await MobileDevice.getProductVersion(serial, idcLogger).catch((error) => {
      idcLogger.error(error);
      return undefined;
    });
  }

  async createSystemInfo(serial: Serial): Promise<DeviceSystemInfo> {
    const udid = serial;
    const info = DefaultDeviceSystemInfo();
    info.version = await MobileDevice.getProductVersion(udid, idcLogger).catch((error) => {
      idcLogger.error(error);
      return 'unknown';
    });
    info.system.model = await MobileDevice.getProductType(udid, idcLogger).catch((error) => {
      idcLogger.error(error);
      return 'unknown';
    });
    const deviceAgentInfo = await this.service.call('dcIdaGetSystemInfoParam', 'dcIdaGetSystemInfoResult', {});
    info.graphics.displays.push({
      vendor: '',
      vendorId: '',
      model: '',
      deviceName: '',
      displayId: '',
      resolutionX: deviceAgentInfo.screenWidth,
      resolutionY: deviceAgentInfo.screenHeight,
    });
    return info;
  }
}
