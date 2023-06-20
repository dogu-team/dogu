import { DoguRunType, NodeEnvType } from '@dogu-private/env-tools';
import { IsFilledString } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsString } from 'class-validator';
import { HostPaths } from '@dogu-tech/node';

export class PreloadDeviceServerEnv {
  @IsIn(NodeEnvType)
  NODE_ENV!: NodeEnvType;

  @IsIn(DoguRunType)
  DOGU_RUN_TYPE!: DoguRunType;

  @IsNumber()
  @Type(() => Number)
  DOGU_DEVICE_SERVER_PORT!: number;
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
}
