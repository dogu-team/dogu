import { ControllerSpec, DefaultPathProvider, IsFilledString } from '@dogu-tech/common';
import { BrowserName, BrowserPlatform, Serial, ThirdPartyPathMap } from '@dogu-tech/types';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { EnsureBrowserAndDriverOptions, EnsureBrowserAndDriverResult } from '../../validations/types/browser-manager';
import { DeviceServerResponseDto } from '../../validations/types/responses';
import { DeviceServerControllerMethodSpec } from '../types';

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

export class GetPathMapResponse {
  @IsObject()
  pathMap!: ThirdPartyPathMap;
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

export class ResignAppFileRequestBody {
  @IsString()
  filePath!: string;
}

export class ResignAppFileResponseBodyData {}

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

  getPathMap: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceHostController,
    method: 'GET',
    path: '/path-map',
    pathProvider: DefaultPathProvider,
    responseBody: DeviceServerResponseDto,
    responseBodyData: GetPathMapResponse,
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

  resignAppFile: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceHostController,
    method: 'POST',
    path: '/resign-app-file',
    pathProvider: DefaultPathProvider,
    requestBody: ResignAppFileRequestBody,
    responseBody: DeviceServerResponseDto,
    responseBodyData: ResignAppFileResponseBodyData,
  }),
};
