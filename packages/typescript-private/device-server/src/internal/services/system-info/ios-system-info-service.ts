import { DefaultDeviceSystemInfo, DeviceSystemInfo, ProfileMethods, Serial } from '@dogu-private/types';
import { Printable } from '@dogu-tech/common';
import { MobileDevice } from '../../externals';
import { IosDeviceAgentService } from '../device-agent/ios-device-agent-service';

export class IosSystemInfoService {
  constructor(private readonly service: IosDeviceAgentService, private readonly logger: Printable) {}

  static async getVersion(serial: Serial, logger: Printable): Promise<string | undefined> {
    return await MobileDevice.getProductVersion(serial, logger).catch((error) => {
      logger.error(error);
      return undefined;
    });
  }

  async createSystemInfo(serial: Serial): Promise<DeviceSystemInfo> {
    const { logger } = this;
    const udid = serial;
    const info = DefaultDeviceSystemInfo();
    info.version = await MobileDevice.getProductVersion(udid, logger).catch((error) => {
      logger.error(error);
      return 'unknown';
    });
    info.system.model = await MobileDevice.getProductType(udid, logger).catch((error) => {
      logger.error(error);
      return 'unknown';
    });
    info.system.manufacturer = 'Apple Inc.';
    const deviceAgentInfo = await this.service.sendWithProtobuf('dcIdaGetSystemInfoParam', 'dcIdaGetSystemInfoResult', {});
    info.graphics.displays.push({
      vendor: '',
      vendorId: '',
      model: '',
      deviceName: '',
      displayId: '',
      resolutionX: deviceAgentInfo?.screenWidth ?? 0,
      resolutionY: deviceAgentInfo?.screenHeight ?? 0,
    });
    const profileResult = await this.service.sendWithProtobuf('dcIdaQueryProfileParam', 'dcIdaQueryProfileResult', {
      profileMethods: [ProfileMethods.Ios.MemVmStatistics],
    });
    info.memLayout.push({ size: profileResult?.info?.mems[0].total ?? 0 });
    return info;
  }
}
