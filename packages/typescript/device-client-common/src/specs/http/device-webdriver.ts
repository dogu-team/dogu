import { ControllerSpec, HeaderRecord, Method, Query } from '@dogu-tech/common';
import { Serial } from '@dogu-tech/types';
import { IsIn, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { DeviceServerResponseDto } from '../../validations/types/responses';
import { DeviceServerControllerMethodSpec } from '../types';

export class RelayRequest {
  @IsString()
  path!: string;

  @IsObject()
  headers!: HeaderRecord;

  @IsIn(Method)
  method!: Method;

  @IsObject()
  query!: Query;

  @IsObject()
  @IsOptional()
  reqBody?: object;
}

export class RelayResponse {
  @IsObject()
  headers!: HeaderRecord;

  @IsNumber()
  status!: number;

  @IsObject()
  @IsOptional()
  resBody?: object;
}

const DeviceWebDriverController = new ControllerSpec({ path: '/device-wd' });
export const DeviceWebDriver = {
  controller: DeviceWebDriverController,

  relayHttp: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceWebDriverController,
    method: 'POST',
    path: '/:serial',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    query: RelayRequest,
    responseBody: DeviceServerResponseDto,
    responseBodyData: RelayResponse,
  }),
};
