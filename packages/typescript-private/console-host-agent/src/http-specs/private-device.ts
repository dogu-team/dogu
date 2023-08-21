import { DeviceId, HostId, OrganizationId, Platform, PrivateProtocol, Serial } from '@dogu-private/types';
import { ControllerMethodSpec, ControllerSpec, IsFilledString, Log } from '@dogu-tech/common';
import { RuntimeInfoDto } from '@dogu-tech/device-client-common';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID, Max, Min, ValidateNested } from 'class-validator';
import { Result, WebSocketProxyId, WebSocketProxyReceive } from '../validations/types/built-in-messages';

type Device = PrivateProtocol.Device;

export class CreateDeviceRequestBody implements Pick<Required<Device>, 'serial' | 'model' | 'platform' | 'hostId' | 'isHost' | 'isVirtual'> {
  @IsString()
  @IsNotEmpty()
  serial!: Serial;

  @IsString()
  @IsNotEmpty()
  model!: string;

  @IsEnum(Platform)
  platform!: Platform;

  @Min(0)
  @Max(1)
  @IsNumber()
  @IsNotEmpty()
  isHost!: number;

  @IsUUID()
  hostId!: HostId;

  @Min(0)
  @Max(1)
  @IsNumber()
  @IsNotEmpty()
  isVirtual!: number;
}

export class CreateDeviceResponseBody implements Pick<Required<Device>, 'deviceId'> {
  @IsUUID()
  deviceId!: DeviceId;
}

export class FindDeviceBySerialQuery implements Pick<Required<Device>, 'serial' | 'hostId' | 'isVirtual'> {
  @IsString()
  @IsNotEmpty()
  serial!: Serial;

  @IsUUID()
  hostId!: HostId;

  @Min(0)
  @Max(1)
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  isVirtual!: number;
}

export class FindDeviceBySerialResponseBody implements Pick<Required<Device>, 'deviceId'> {
  @IsUUID()
  deviceId!: DeviceId;
}

export class PullDeviceParamDatasRequestBody {
  @IsNumber()
  count!: number;
}

export class PullDeviceParamDatasResponseBody {
  @IsArray()
  datas!: string[];
}

export class PushDeviceResultRequestBody {
  @ValidateNested()
  @Type(() => Result)
  result!: Result;
}

export class UpdateDeviceRequestBody
  implements Pick<Required<Device>, 'hostId' | 'platform' | 'model' | 'version' | 'manufacturer' | 'isVirtual' | 'resolutionWidth' | 'resolutionHeight'>
{
  @IsFilledString()
  hostId!: HostId;

  @IsEnum(Platform)
  platform!: Platform;

  @IsString()
  model!: string;

  @IsString()
  version!: string;

  @IsString()
  manufacturer!: string;

  @Min(0)
  @Max(1)
  @IsNumber()
  @IsNotEmpty()
  isVirtual!: number;

  @IsNumber()
  @Type(() => Number)
  resolutionWidth!: number;

  @IsNumber()
  @Type(() => Number)
  resolutionHeight!: number;
}

export class WriteStepLogsRequestBody {
  @ValidateNested({ each: true })
  @Type(() => Log)
  @IsArray()
  logs!: Log[];
}

export class WriteDeviceRunTimeInfosRequestBody {
  @ValidateNested({ each: true })
  @Type(() => RuntimeInfoDto)
  @IsArray()
  runtimeInfos!: RuntimeInfoDto[];
}

const PrivateDeviceController = new ControllerSpec({
  path: '/private/organizations/:organizationId/devices',
});

export const PrivateDevice = {
  controller: PrivateDeviceController,

  createDevice: new ControllerMethodSpec({
    controllerSpec: PrivateDeviceController,
    method: 'POST',
    path: '/',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId) {}
    },
    requestBody: CreateDeviceRequestBody,
    responseBody: CreateDeviceResponseBody,
  }),

  findDeviceBySerial: new ControllerMethodSpec({
    controllerSpec: PrivateDeviceController,
    method: 'GET',
    path: '/',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId) {}
    },
    query: FindDeviceBySerialQuery,
    responseBody: FindDeviceBySerialResponseBody,
  }),

  pullDeviceParamDatas: new ControllerMethodSpec({
    controllerSpec: PrivateDeviceController,
    method: 'POST',
    path: '/:deviceId/paramDatas/pull',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId, readonly deviceId: DeviceId) {}
    },
    requestBody: PullDeviceParamDatasRequestBody,
    responseBody: PullDeviceParamDatasResponseBody,
  }),

  pushDeviceResult: new ControllerMethodSpec({
    controllerSpec: PrivateDeviceController,
    method: 'POST',
    path: '/:deviceId/results/:resultId/push',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId, readonly deviceId: DeviceId, readonly resultId: string) {}
    },
    requestBody: PushDeviceResultRequestBody,
  }),

  pushWebSocketProxyReceive: new ControllerMethodSpec({
    controllerSpec: PrivateDeviceController,
    method: 'POST',
    path: '/:deviceId/virtualWebSockets/:WebSocketProxyId/receive/push',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId, readonly deviceId: DeviceId, readonly WebSocketProxyId: WebSocketProxyId) {}
    },
    requestBody: WebSocketProxyReceive,
  }),

  updateDeviceHeartbeatNow: new ControllerMethodSpec({
    controllerSpec: PrivateDeviceController,
    method: 'PATCH',
    path: '/:deviceId/heartbeat/now',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId, readonly deviceId: DeviceId) {}
    },
  }),

  updateDevice: new ControllerMethodSpec({
    controllerSpec: PrivateDeviceController,
    method: 'PATCH',
    path: '/:deviceId',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId, readonly deviceId: DeviceId) {}
    },
    requestBody: UpdateDeviceRequestBody,
  }),

  writeDeviceRunTimeInfos: new ControllerMethodSpec({
    controllerSpec: PrivateDeviceController,
    method: 'POST',
    path: '/:deviceId/device-runtime-infos',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId, readonly deviceId: DeviceId) {}
    },
    requestBody: WriteDeviceRunTimeInfosRequestBody,
  }),
};
