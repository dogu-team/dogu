import { DoguRunType, NodeEnvType } from '@dogu-private/env-tools';
import { IsFilledString } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsString } from 'class-validator';

export class PreloadDeviceServerEnv {
  @IsIn(NodeEnvType)
  NODE_ENV!: NodeEnvType;

  @IsIn(DoguRunType)
  DOGU_RUN_TYPE!: DoguRunType;

  @IsNumber()
  @Type(() => Number)
  DOGU_DEVICE_SERVER_PORT!: number;

  @IsString()
  DOGU_DOST_RESOURCES_PATH = '';

  /**
   * @deprecated use ANDROID_HOME instead
   */
  @IsFilledString()
  ANDROID_SDK_ROOT = '$HOME/.dogu/android';
}

export class DeviceServerEnv extends PreloadDeviceServerEnv {
  @IsFilledString()
  JAVA_HOME!: string;

  @IsFilledString()
  ANDROID_HOME!: string;

  @IsFilledString()
  APPIUM_HOME!: string;
}
