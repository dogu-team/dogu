import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsFilledString } from '../../common/decorators.js';
import { ControllerSpec, DefaultPathProvider } from '../../common/specs.js';
import { BrowserName, BrowserPlatform, EnsureBrowserAndDriverOptions, EnsureBrowserAndDriverResult, Serial } from '../../types/types.js';
import { DeviceServerResponseDto } from '../../validations/types/responses.js';
import { DeviceServerControllerMethodSpec } from '../types.js';

export class GetFreePortQuery {
  @IsArray()
  @IsOptional()
  excludes?: number[];

  @IsNumber()
  @IsOptional()
  offset?: number;
}

export class GetFreePortResponse {
  @IsNumber()
  port!: number;
}

export class DeviceHostEnsureBrowserAndDriverRequestBody implements EnsureBrowserAndDriverOptions {
  @IsIn(BrowserName)
  browserName!: BrowserName;

  @IsIn(BrowserPlatform)
  browserPlatform!: BrowserPlatform;

  @IsString()
  @IsOptional()
  browserVersion?: string;

  @IsString()
  @IsOptional()
  deviceSerial?: Serial;
}

export class DeviceHostEnsureBrowserAndDriverResponseBodyData implements EnsureBrowserAndDriverResult {
  @IsIn(BrowserName)
  browserName!: BrowserName;

  @IsIn(BrowserPlatform)
  browserPlatform!: BrowserPlatform;

  @IsFilledString()
  browserVersion!: string;

  @IsNumber()
  @Type(() => Number)
  browserMajorVersion!: number;

  @IsFilledString()
  browserDriverVersion!: string;

  @IsFilledString()
  browserDriverPath!: string;

  @IsString()
  @IsOptional()
  browserPath?: string;

  @IsString()
  @IsOptional()
  browserPackageName?: string;

  @IsString()
  @IsOptional()
  deviceSerial?: Serial;
}

const DeviceHostController = new ControllerSpec({ path: '/device-host' });
export const DeviceHost = {
  controller: DeviceHostController,

  getFreePort: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceHostController,
    method: 'GET',
    path: '/free-port',
    pathProvider: DefaultPathProvider,
    query: GetFreePortQuery,
    responseBody: DeviceServerResponseDto,
    responseBodyData: GetFreePortResponse,
  }),

  ensureBrowserAndDriver: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceHostController,
    method: 'POST',
    path: '/ensure-browser-and-driver',
    pathProvider: DefaultPathProvider,
    requestBody: DeviceHostEnsureBrowserAndDriverRequestBody,
    responseBody: DeviceServerResponseDto,
    responseBodyData: DeviceHostEnsureBrowserAndDriverResponseBodyData,
  }),
};
