import { Code, DeviceFoldRequestDto, GeoLocationDto, LocaleCodeDto, Platform, platformTypeFromPlatform, Serial } from '@dogu-private/types';
import { Instance } from '@dogu-tech/common';
import { CreateLocalDeviceDetectTokenRequest, Device, DeviceConfigDto } from '@dogu-tech/device-client-common';
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { toErrorResultDto } from '../device-webdriver/device-webdriver.controller';
import { AdbSerial } from '../internal/externals/index';
import { LocalDeviceService } from '../local-device/local-device.service';
import { DoguLogger } from '../logger/logger';
import { appiumCapabilitiesNotFoundError, appiumContextNotFoundError } from '../response-utils';
import { ScanService } from '../scan/scan.service';
import { deviceNotFoundError } from './device.utils';

@Controller(Device.controller)
export class DeviceController {
  constructor(
    private readonly scanService: ScanService,
    private readonly configService: ConfigService,
    private readonly localDeviceService: LocalDeviceService,
    private logger: DoguLogger,
  ) {}

  @Get(Device.getDeviceSerials.path)
  getDeviceSerials(): Instance<typeof Device.getDeviceSerials.responseBody> {
    const serials = this.scanService.serials();
    return {
      value: {
        $case: 'data',
        data: {
          serials,
        },
      },
    };
  }

  @Get(Device.getDevicePlatformSerials.path)
  getDevicePlatformSerials(): Instance<typeof Device.getDevicePlatformSerials.responseBody> {
    const platformSerials = this.scanService.platformSerials();
    return {
      value: {
        $case: 'data',
        data: {
          platformSerials,
        },
      },
    };
  }

  @Get(Device.getDeviceSystemInfo.path)
  getDeviceSystemInfo(@Param('serial') serial: Serial): Instance<typeof Device.getDeviceSystemInfo.responseBody> {
    const device = this.scanService.findChannel(serial);
    if (device === null) {
      return deviceNotFoundError(serial);
    }
    return {
      value: {
        $case: 'data',
        data: device.info,
      },
    };
  }

  @Patch(Device.updateDeviceConfig.path)
  async updateDeviceConfig(@Param('serial') serial: Serial, @Body() deviceConfig: DeviceConfigDto): Promise<Instance<typeof Device.updateDeviceConfig.responseBody>> {
    const device = this.scanService.findChannel(serial);
    if (device === null) {
      return deviceNotFoundError(serial);
    }
    await this.configService.applyConfig(serial, deviceConfig);
    return {
      value: {
        $case: 'data',
        data: {},
      },
    };
  }

  @Post(Device.rebootDevice.path)
  async reboot(@Param('serial') serial: Serial): Promise<Instance<typeof Device.rebootDevice.responseBody>> {
    const device = this.scanService.findChannel(serial);
    if (device === null) {
      return deviceNotFoundError(serial);
    }
    await device.reboot();
    return {
      value: {
        $case: 'data',
        data: {},
      },
    };
  }

  /**
   * @note called from console front. useDeviceInspector.ts
   */
  @Post(Device.createLocalDeviceDetectToken.path)
  createLocalDeviceDetectToken(
    @Param('serial') serial: Serial,
    @Body() body: CreateLocalDeviceDetectTokenRequest,
  ): Instance<typeof Device.createLocalDeviceDetectToken.responseBody> {
    this.localDeviceService.saveToken(body.token, body.lifeTimeSeconds);
    return {
      value: {
        $case: 'data',
        data: {},
      },
    };
  }

  @Get(Device.getLocalDeviceDetectToken.path)
  getLocalDeviceDetectToken(): Instance<typeof Device.getLocalDeviceDetectToken.responseBody> {
    return {
      value: {
        $case: 'data',
        data: {
          tokens: this.localDeviceService.getTokens(),
        },
      },
    };
  }

  @Get(Device.getAppiumContextInfo.path)
  async getAppiumContextInfo(@Param('serial') serial: Serial): Promise<Instance<typeof Device.getAppiumContextInfo.responseBody>> {
    const channel = this.scanService.findChannel(serial);
    if (channel === null) {
      return deviceNotFoundError(serial);
    }
    const appiumContext = await channel.getAppiumContext();
    if (appiumContext === null) {
      return appiumContextNotFoundError(serial);
    }
    try {
      const data: Instance<typeof Device.getAppiumContextInfo.responseBodyData> = {
        info: appiumContext.getInfo(),
      };
      return {
        value: {
          $case: 'data',
          data,
        },
      };
    } catch (error) {
      return {
        value: {
          $case: 'error',
          error: {
            code: Code.CODE_DEVICE_SERVER_APPIUM_CONTEXT_INFO_NOT_FOUND,
            message: 'Appium context get info failed',
            details: {
              serial,
            },
          },
        },
      };
    }
  }

  @Get(Device.getAppiumCapabilities.path)
  async getAppiumCapabilities(@Param('serial') serial: Serial): Promise<Instance<typeof Device.getAppiumCapabilities.responseBody>> {
    const channel = this.scanService.findChannel(serial);
    if (channel === null) {
      return deviceNotFoundError(serial);
    }

    const capabilities = await channel.getAppiumCapabilities();
    if (capabilities === null) {
      return appiumCapabilitiesNotFoundError(serial);
    }

    const data: Instance<typeof Device.getAppiumCapabilities.responseBodyData> = {
      capabilities,
    };

    return {
      value: {
        $case: 'data',
        data,
      },
    };
  }

  @Get(Device.getSystemBarVisibility.path)
  async getSystemBarVisibility(@Param('serial') serial: Serial): Promise<Instance<typeof Device.getSystemBarVisibility.responseBody>> {
    const channel = this.scanService.findChannel(serial);
    if (channel === null) {
      return deviceNotFoundError(serial);
    }

    if (channel.platform !== Platform.PLATFORM_ANDROID) {
      return {
        value: {
          $case: 'error',
          error: {
            code: Code.CODE_DEVICE_SERVER_UNEXPECTED_ERROR,
            message: 'Not supported platform',
            details: {
              serial,
              platform: platformTypeFromPlatform(channel.platform),
            },
          },
        },
      };
    }

    try {
      const adb = new AdbSerial(channel.serial, this.logger);
      const systemBarVisibility = await adb.getSystemBarVisibility();
      return {
        value: {
          $case: 'data',
          data: systemBarVisibility,
        },
      };
    } catch (error) {
      return {
        value: {
          $case: 'error',
          error: {
            code: Code.CODE_DEVICE_SERVER_UNEXPECTED_ERROR,
            message: 'Get system bar visibility failed',
            details: {
              cause: toErrorResultDto(serial, error),
            },
          },
        },
      };
    }
  }

  @Get(Device.getLocale.path)
  async getLocale(@Param('serial') serial: Serial): Promise<Instance<typeof Device.getLocale.responseBody>> {
    const channel = this.scanService.findChannel(serial);
    if (channel === null) {
      return deviceNotFoundError(serial);
    }

    const localeCode = await channel.getLocale();
    return {
      value: {
        $case: 'data',
        data: {
          localeCode,
        },
      },
    };
  }

  @Post(Device.setLocale.path)
  async setLocale(@Param('serial') serial: Serial, @Body() localeCodeDto: LocaleCodeDto): Promise<Instance<typeof Device.setLocale.responseBody>> {
    const device = this.scanService.findChannel(serial);
    if (device === null) {
      return deviceNotFoundError(serial);
    }
    await device.setLocale(localeCodeDto);
    const localeCode = await device.getLocale();
    return {
      value: {
        $case: 'data',
        data: {
          localeCode,
        },
      },
    };
  }

  @Get(Device.getGeoLocation.path)
  async getGeoLocation(@Param('serial') serial: Serial): Promise<Instance<typeof Device.getGeoLocation.responseBody>> {
    const channel = this.scanService.findChannel(serial);
    if (channel === null) {
      return deviceNotFoundError(serial);
    }

    const location = await channel.getGeoLocation();
    return {
      value: {
        $case: 'data',
        data: {
          location,
        },
      },
    };
  }

  @Post(Device.setGeoLocation.path)
  async setGeoLocation(@Param('serial') serial: Serial, @Body() geoLocationDto: GeoLocationDto): Promise<Instance<typeof Device.setGeoLocation.responseBody>> {
    const device = this.scanService.findChannel(serial);
    if (device === null) {
      return deviceNotFoundError(serial);
    }
    await device.setGeoLocation(geoLocationDto);
    const location = await device.getGeoLocation();
    return {
      value: {
        $case: 'data',
        data: {
          location,
        },
      },
    };
  }

  @Get(Device.getScreenshot.path)
  async getScreenshot(@Param('serial') serial: Serial): Promise<Instance<typeof Device.getScreenshot.responseBody>> {
    const channel = this.scanService.findChannel(serial);
    if (channel === null) {
      return deviceNotFoundError(serial);
    }

    const base64 = await channel.getScreenshot();
    return {
      value: {
        $case: 'data',
        data: {
          base64,
        },
      },
    };
  }

  @Get(Device.getFoldStatus.path)
  async getFoldStatus(@Param('serial') serial: Serial): Promise<Instance<typeof Device.getFoldStatus.responseBody>> {
    const device = this.scanService.findChannel(serial);
    if (device === null) {
      return deviceNotFoundError(serial);
    }

    const status = await device.getFoldStatus();
    return {
      value: {
        $case: 'data',
        data: {
          isFoldable: status.isFoldable,
          isFolded: status.isFolded,
        },
      },
    };
  }

  @Post(Device.fold.path)
  async fold(@Param('serial') serial: Serial, @Body() requestDto: DeviceFoldRequestDto): Promise<Instance<typeof Device.fold.responseBody>> {
    const device = this.scanService.findChannel(serial);
    if (device === null) {
      return deviceNotFoundError(serial);
    }
    await device.fold(requestDto.fold);
    const status = await device.getFoldStatus();
    return {
      value: {
        $case: 'data',
        data: status,
      },
    };
  }
}
