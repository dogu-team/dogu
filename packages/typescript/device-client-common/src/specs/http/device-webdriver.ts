import { ControllerSpec, HeaderRecord, Method, Query } from '@dogu-tech/common';
import { Serial } from '@dogu-tech/types';
import { IsIn, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { DeviceNotFoundErrorDetails, DeviceServerResponseDto } from '../../validations/types/responses';
import { DeviceServerControllerMethodSpec } from '../types';

export class RelayRequest {
  @IsString()
  path!: string;

  @IsObject()
  headers!: HeaderRecord;

  @IsIn(Method)
  method!: Method;

  @IsObject()
  @IsOptional()
  query?: Query;

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

export class SessionDeletedParam {
  @IsString()
  sessionId!: string;
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

  sessionDeleted: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceWebDriverController,
    method: 'DELETE',
    path: '/:serial',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    query: SessionDeletedParam,
    responseBody: DeviceServerResponseDto,
    responseBodyError: DeviceNotFoundErrorDetails,
  }),
};
