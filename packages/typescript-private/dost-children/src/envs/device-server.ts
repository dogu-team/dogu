import { DoguRunType, NodeEnvType } from '@dogu-private/env-tools';
import { IsFilledString, TransformBooleanString } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsNumber, IsString } from 'class-validator';

export class PreloadDeviceServerEnv {
  @IsIn(NodeEnvType)
  NODE_ENV!: NodeEnvType;

  @IsIn(DoguRunType)
  DOGU_RUN_TYPE!: DoguRunType;

  @IsNumber()
  @Type(() => Number)
  DOGU_DEVICE_SERVER_PORT!: number;

  @IsString()
  DOGU_DEVICE_PLATFORM_ENABLED!: string;
}

export class DeviceServerEnv extends PreloadDeviceServerEnv {
  @IsFilledString()
  JAVA_HOME = HostPaths.external.defaultJavaHomePath();

  @IsFilledString()
  ANDROID_HOME = HostPaths.external.defaultAndroidHomePath();

  @IsFilledString()
  APPIUM_HOME = HostPaths.external.defaultAppiumHomePath();

  @IsString()
  DOGU_PACKAGED_RESOURCES_PATH = '';

  @IsBoolean()
  @TransformBooleanString()
  DOGU_DEVICE_IOS_RESTART_ON_INIT = false;

  @IsBoolean()
  @TransformBooleanString()
  DOGU_DEVICE_IOS_IS_IDAPROJECT_VALIDATED = false;

  @IsString()
  DOGU_LINUX_DEVICE_SERIAL = '';
}
