import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { ControllerSpec, DefaultPathProvider } from '../../common/specs.js';
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
};
