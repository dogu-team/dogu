import { ControllerMethodSpec, ControllerSpec } from '@dogu-tech/common';
import { DeviceId, OrganizationId, Platform } from '@dogu-tech/types';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsNumber, ValidateNested } from 'class-validator';

export class GameRuntimeInfo {
  @IsEnum(Platform)
  platform!: Platform;

  @IsNumber()
  fps!: number;

  @IsDate()
  @Type(() => Date)
  localTimeStamp!: Date;
}

export class WriteGameRunTimeInfosRequestBody {
  @ValidateNested({ each: true })
  @Type(() => GameRuntimeInfo)
  @IsArray()
  gameRuntimeInfos!: GameRuntimeInfo[];
}

const PublicDeviceController = new ControllerSpec({
  path: '/public/organizations/:organizationId/devices',
});

export const PublicDevice = {
  controller: PublicDeviceController,
  writeGameRunTimeInfos: new ControllerMethodSpec({
    controllerSpec: PublicDeviceController,
    method: 'POST',
    path: '/:deviceId/game-runtime-infos',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId, readonly deviceId: DeviceId) {}
    },
    requestBody: WriteGameRunTimeInfosRequestBody,
  }),
};
