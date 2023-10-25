import { DeviceSystemInfo, Platform } from '@dogu-private/types';
import { AdbSerial } from '../../externals/cli/adb/adb';

export class AndroidSystemInfoService {
  constructor(private adb: AdbSerial) {}
  async createSystemInfo(): Promise<DeviceSystemInfo> {
    const { adb } = this;
    const deviceProp = await adb.getProps();
    const isVirtual = deviceProp.ro_build_characteristics === 'emulator';
    const procCpuInfos = await adb.getProcCpuInfo();
    const procMemInfo = await adb.getProcMemInfo();
    const displaySize = await adb.getDisplaySize();
    const dfInfos = (await adb.getDfInfo())
      .filter((x) => x.Mounted.startsWith('/data') || x.Mounted.startsWith('/storage'))
      .map((x) => {
        return { name: x.Mounted, size: x._1K_blocks };
      });
    let modelName = deviceProp.ro_product_model;
    if (isVirtual) {
      modelName = await adb.getEmulatorName();
    }
    const info: DeviceSystemInfo = {
      version: deviceProp.ro_build_version_release,
      timeMs: Date.now(),
      nickname: modelName,
      marketName: '',
      isVirtual,
      system: {
        manufacturer: deviceProp.ro_product_manufacturer,
        model: modelName,
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
