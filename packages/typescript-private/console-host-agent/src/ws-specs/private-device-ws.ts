import { DeviceId, HostId, OrganizationId } from '@dogu-private/types';
import { WebSocketSpec } from '@dogu-tech/common';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PrivateDeviceWsConnectionDto {
  @IsNotEmpty()
  @IsString()
  organizationId!: OrganizationId;

  @IsNotEmpty()
  @IsString()
  hostId!: HostId;

  @IsNotEmpty()
  @IsString()
  deviceId!: DeviceId;
}
export class WsPullDeviceParamDatasRequestBody {}

export class WsPullDeviceParamDatasResponseBody {
  @IsArray()
  datas!: string[];

  @IsOptional()
  @IsArray()
  timeStamps!: string[];
}

export const PrivateDeviceWs = {
  pullDeviceParamDatas: new WebSocketSpec({
    path: '/ws/device/paramDatas/pull',
    sendMessage: WsPullDeviceParamDatasRequestBody,
    receiveMessage: WsPullDeviceParamDatasResponseBody,
  }),
};
