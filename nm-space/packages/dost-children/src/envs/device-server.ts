import { DoguRunType, NodeEnvType } from '@dogu-private/types';
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
  APPLE_RESIGN_IDENTITY_NAME = 'Apple Development: Apple Dogu (S8F42MYPGH)';

  @IsString()
  DOGU_PACKAGED_RESOURCES_PATH = '';

  @IsBoolean()
  @TransformBooleanString()
  DOGU_DEVICE_RESTART_IOS_ON_INIT = false;

  @IsBoolean()
  @TransformBooleanString()
  DOGU_DEVICE_IOS_IS_IDAPROJECT_VALIDATED = false;

  @IsBoolean()
  @TransformBooleanString()
  DOGU_DEVICE_IS_SHAREABLE = false;

  @IsString()
  DOGU_LINUX_DEVICE_SERIAL = '';

  @IsString()
  DOGU_WIFI_SSID = '';

  @IsString()
  DOGU_WIFI_PASSWORD = '';

  @IsBoolean()
  @TransformBooleanString()
  DOGU_USE_SENTRY = false;

  @IsFilledString()
  DOGU_SECRET_INITIAL_ADMIN_TOKEN = '';
}
