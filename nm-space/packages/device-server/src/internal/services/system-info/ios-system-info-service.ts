import { DefaultDeviceSystemInfo, DeviceSystemInfo, ProfileMethods, Serial } from '@dogu-private/types';
import { Printable, retry } from '@dogu-tech/common';
import semver, { SemVer } from 'semver';
import { MobileDevice } from '../../externals';
import { IosDeviceAgentService } from '../device-agent/ios-device-agent-service';

export class IosSystemInfoService {
  constructor(
    private readonly service: IosDeviceAgentService,
    private readonly logger: Printable,
  ) {}

  static async getVersion(serial: Serial, logger: Printable): Promise<SemVer> {
    return await retry(
      async () => {
        const productVersion = await MobileDevice.getProductVersion(serial, logger).catch((error) => {
          logger.error(error);
          return undefined;
        });

        if (!productVersion) {
          throw new Error(`iOS version is null. serial: ${serial}`);
        }
        const version = semver.coerce(productVersion);
        if (!version) {
          throw new Error(`iOS version is invalid. serial: ${serial}, version: ${productVersion}`);
        }
        return version;
      },
      { retryCount: 3, retryInterval: 200, printable: logger },
    );
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
    await retry(
      async () => {
        const deviceAgentInfo = await this.service.send('dcIdaGetSystemInfoParam', 'dcIdaGetSystemInfoResult', {});
        if (!deviceAgentInfo) {
          throw new Error('IosSystemInfoService.createSystemInfo systemInfo is null');
        }
        info.graphics.displays.push({
          vendor: '',
          vendorId: '',
          model: '',
          deviceName: '',
          displayId: '',
          resolutionX: deviceAgentInfo?.screenWidth ?? 0,
          resolutionY: deviceAgentInfo?.screenHeight ?? 0,
        });
      },
      { retryCount: 5, retryInterval: 500, printable: logger },
    );
    await retry(
      async () => {
        const profileResult = await this.service.send('dcIdaQueryProfileParam', 'dcIdaQueryProfileResult', {
          profileMethods: [ProfileMethods.Ios.MemVmStatistics],
        });
        if (!profileResult) {
          throw new Error('IosSystemInfoService.createSystemInfo profileResult is null');
        }
        info.memLayout.push({ size: profileResult?.info?.mems[0].total ?? 0 });
      },
      { retryCount: 5, retryInterval: 500, printable: logger },
    );
    return info;
  }
}
