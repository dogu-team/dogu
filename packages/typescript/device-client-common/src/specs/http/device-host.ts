import { ControllerSpec, DefaultPathProvider } from '@dogu-tech/common';
import { ThirdPartyPathMap } from '@dogu-tech/types';
import { IsArray, IsNumber, IsObject, IsOptional } from 'class-validator';
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
};
