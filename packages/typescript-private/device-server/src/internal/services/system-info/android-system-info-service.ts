import { DeviceSystemInfo, Platform, Serial } from '@dogu-private/types';
import { Adb } from '../../externals/index';
import { SystemInfoService } from './system-info-service-interface';

export class AndroidSystemInfoService implements SystemInfoService {
  async createSystemInfo(serial: Serial): Promise<DeviceSystemInfo> {
    const deviceProp = await Adb.getProps(serial);
    const procCpuInfos = await Adb.getProcCpuInfo(serial);
    const procMemInfo = await Adb.getProcMemInfo(serial);
    const displaySize = await Adb.getDisplaySize(serial);
    const dfInfos = (await Adb.getDfInfo(serial))
      .filter((x) => x.Mounted.startsWith('/data') || x.Mounted.startsWith('/storage'))
      .map((x) => {
        return { name: x.Mounted, size: x._1K_blocks };
      });
    const info: DeviceSystemInfo = {
      version: deviceProp.ro_build_version_release,
      timeMs: Date.now(),
      nickname: await Adb.getNickname(serial),
      marketName: '',
      system: {
        manufacturer: deviceProp.ro_product_manufacturer,
        model: deviceProp.ro_product_model,
        version: '',
        serial: deviceProp.ro_serialno,
        uuid: '',
        sku: '',
      },
      bios: {
        vendor: '',
        version: '',
        releaseDate: deviceProp.ro_system_build_date,
        revision: '',
        serial: '',
        language: '',
        features: [],
      },
      baseboard: {
        manufacturer: deviceProp.ro_product_brand,
        model: deviceProp.ro_product_brand,
        version: '',
        serial: '',
        assetTag: '',
        memMax: null,
        memSlots: null,
      },
      chassis: {
        manufacturer: '',
        model: '',
        type: '',
        version: '',
        serial: '',
        assetTag: '',
        sku: '',
      },
      os: {
        platform: Platform.PLATFORM_ANDROID,
        arch: deviceProp.ro_product_cpu_abi,
        hostname: deviceProp.ro_product_name,
      },
      uuid: {
        os: '',
        hardware: deviceProp.ro_serialno,
      },
      cpu: {
        manufacturer: deviceProp.ro_product_brand,
        brand: deviceProp.ro_product_brand,
        speed: 0,
        cores: procCpuInfos.length,
        physicalCores: procCpuInfos.length,
      },
      graphics: {
        controllers: [],
        displays: [
          {
            vendor: '',
            vendorId: '',
            model: '',
            deviceName: '',
            displayId: '',
            resolutionX: displaySize.width,
            resolutionY: displaySize.height,
          },
        ],
      },
      net: [],
      memLayout: [
        {
          size: procMemInfo.MemTotal,
        },
      ],
      diskLayout: dfInfos,
    };

    return info;
  }
}
