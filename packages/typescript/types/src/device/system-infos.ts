import { Platform } from '../protocol/generated/tsproto/outer/platform';

export interface DeviceSystemInfo {
  nickname: string;
  marketName: string;
  version: string;
  timeMs: number;
  system: {
    manufacturer: string;
    model: string;
    version: string;
    serial: string;
    uuid: string;
    sku: string;
  };
  bios: {
    vendor: string;
    version: string;
    releaseDate: string;
    revision: string;
    serial?: string;
    language?: string;
    features?: string[];
  };
  baseboard: {
    manufacturer: string;
    model: string;
    version: string;
    serial: string;
    assetTag: string;
    memMax: number | null;
    memSlots: number | null;
  };
  chassis: {
    manufacturer: string;
    model: string;
    type: string;
    version: string;
    serial: string;
    assetTag: string;
    sku: string;
  };
  os: {
    platform: Platform;
    arch: string;
    hostname: string;
  };
  uuid: {
    os: string;
    hardware: string;
  };
  cpu: {
    manufacturer: string;
    brand: string;
    speed: number;
    cores: number;
    physicalCores: number;
  };
  graphics: {
    controllers: {
      vendor: string;
      vendorId?: string;
      model: string;
      deviceId?: string;
      cores?: number;
      name?: string;
      pciBus?: string;
      pciID?: string;
      fanSpeed?: number;
      memoryTotal?: number;
    }[];
    displays: {
      vendor: string;
      vendorId: string;
      model: string;
      deviceName: string;
      displayId: string;
      resolutionX: number;
      resolutionY: number;
    }[];
  };
  net: {
    iface: string;
    ifaceName: string;
    ip4: string;
    ip4subnet: string;
    ip6: string;
    ip6subnet: string;
    mac: string;
    type: string;
    duplex: string;
    mtu: number;
    speed: number;
    dhcp: boolean;
  }[];
  memLayout: {
    size: number;
    [key: string]: unknown;
  }[];
  diskLayout: {
    name: string;
    size: number;
    [key: string]: unknown;
  }[];
}

export function DefaultDeviceSystemInfo(): DeviceSystemInfo {
  return {
    nickname: '',
    marketName: '',
    version: '',
    timeMs: 0,
    system: {
      manufacturer: '',
      model: '',
      version: '',
      serial: '',
      uuid: '',
      sku: '',
    },
    bios: {
      vendor: '',
      version: '',
      releaseDate: '',
      revision: '',
      serial: '',
      language: '',
      features: [],
    },
    baseboard: {
      manufacturer: '',
      model: '',
      version: '',
      serial: '',
      assetTag: '',
      memMax: 0,
      memSlots: 0,
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
      platform: Platform.PLATFORM_UNSPECIFIED,
      arch: '',
      hostname: '',
    },
    uuid: {
      os: '',
      hardware: '',
    },
    cpu: {
      manufacturer: '',
      brand: '',
      speed: 0,
      cores: 0,
      physicalCores: 0,
    },
    graphics: {
      controllers: [],
      displays: [],
    },
    net: [],
    memLayout: [],
    diskLayout: [],
  };
}
