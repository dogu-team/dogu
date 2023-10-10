import { DeviceConfig, Platform, ProfileMethod, ProfileMethodKind, ProfileMethods, ProfileMethodWithConfig } from '@dogu-tech/types';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNotEmptyObject, IsNumber, IsString, ValidateNested, validateSync, ValidationError } from 'class-validator';

export class ProfileMethodDto implements ProfileMethod {
  @IsEnum(ProfileMethodKind)
  kind!: ProfileMethodKind;

  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class ProfileMethodWithConfigDto implements Required<ProfileMethodWithConfig> {
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => ProfileMethodDto)
  profileMethod!: ProfileMethodDto;

  @IsNumber()
  @IsNotEmpty()
  periodSec!: number;
}

export class DeviceConfigValidationError extends Error {
  constructor(readonly errors: ValidationError[]) {
    super('deviceconfig validation failed');
  }
}

export class DeviceConfigDto implements DeviceConfig {
  constructor(init: Required<DeviceConfig>) {
    Object.assign(this, init);
    const error = validateSync(this);
    if (!error || 0 === error.length) {
      return;
    }
    throw new DeviceConfigValidationError(error);
  }

  @ValidateNested({ each: true })
  @Type(() => ProfileMethodWithConfigDto)
  @IsArray()
  profileMethods: ProfileMethodWithConfigDto[] = [];
}

export function DefaultDeviceConfig(platform: Platform): DeviceConfigDto {
  switch (platform) {
    case Platform.PLATFORM_WINDOWS:
      return {
        profileMethods: [
          { profileMethod: ProfileMethods.Desktop.Cpu, periodSec: 3 },
          { profileMethod: ProfileMethods.Desktop.CpuFreq, periodSec: 3 },
          { profileMethod: ProfileMethods.Desktop.Mem, periodSec: 3 },
          { profileMethod: ProfileMethods.Desktop.Display, periodSec: 3 },
        ],
      };
    case Platform.PLATFORM_MACOS:
      return {
        profileMethods: [
          { profileMethod: ProfileMethods.Desktop.Cpu, periodSec: 3 },
          { profileMethod: ProfileMethods.Desktop.CpuFreq, periodSec: 3 },
          { profileMethod: ProfileMethods.Desktop.Mem, periodSec: 3 },
          { profileMethod: ProfileMethods.Desktop.Display, periodSec: 3 },
        ],
      };

    case Platform.PLATFORM_LINUX:
      return {
        profileMethods: [
          { profileMethod: ProfileMethods.Desktop.Cpu, periodSec: 3 },
          { profileMethod: ProfileMethods.Desktop.CpuFreq, periodSec: 3 },
          { profileMethod: ProfileMethods.Desktop.Mem, periodSec: 3 },
          { profileMethod: ProfileMethods.Desktop.Display, periodSec: 3 },
        ],
      };
    case Platform.PLATFORM_ANDROID:
      return {
        profileMethods: [
          { profileMethod: ProfileMethods.Android.CpuShellTop, periodSec: 3 },
          { profileMethod: ProfileMethods.Android.CpuFreqCat, periodSec: 3 },
          { profileMethod: ProfileMethods.Android.MemProcMemInfo, periodSec: 3 },
          { profileMethod: ProfileMethods.Android.FsProcDiskStats, periodSec: 3 },
          { profileMethod: ProfileMethods.Android.NetTrafficStats, periodSec: 3 },
          { profileMethod: ProfileMethods.Android.ProcessShellTop, periodSec: 3 },
          { profileMethod: ProfileMethods.Android.Display, periodSec: 3 },
          { profileMethod: ProfileMethods.Android.BlockDeveloperOptions, periodSec: 2 },
        ],
      };
    case Platform.PLATFORM_IOS:
      return {
        profileMethods: [
          { profileMethod: ProfileMethods.Ios.CpuLoadInfo, periodSec: 3 },
          { profileMethod: ProfileMethods.Ios.MemVmStatistics, periodSec: 3 },
          { profileMethod: ProfileMethods.Ios.Display, periodSec: 3 },
        ],
      };
    default:
      break;
  }
  return {
    profileMethods: [],
  };
}
