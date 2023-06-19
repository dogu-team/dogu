import { CloudDeviceId, OrganizationId } from '@dogu-private/types';
import { ControllerMethodSpec, ControllerSpec } from '@dogu-tech/common';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CloudDeviceBase } from '../base/cloud-device';

export class FindAllCloudDeviceResponseDto {
  cloudDevices!: CloudDeviceBase[];
}

export class FindCloudDeviceByIdResponseDto {
  cloudDevice!: CloudDeviceBase;
}

export class RentalCloudDeviceRequestDto {
  @IsNotEmpty()
  @IsUUID()
  organizationId!: OrganizationId;
}

export class RentalCloudDeviceResponseDto {
  cloudDevice!: CloudDeviceBase;
}

const CloudDeviceController = new ControllerSpec({
  path: '/cloud-devices',
});

export const CloudDevice = {
  controller: CloudDeviceController,

  findAllCloudDevice: new ControllerMethodSpec({
    controllerSpec: CloudDeviceController,
    method: 'GET',
    path: '/',
    pathProvider: class {
      constructor() {}
    },
    responseBody: FindAllCloudDeviceResponseDto,
  }),

  findCloudDeviceById: new ControllerMethodSpec({
    controllerSpec: CloudDeviceController,
    method: 'GET',
    path: '/:cloudDeviceId',
    pathProvider: class {
      constructor(readonly cloudDeviceId: CloudDeviceId) {}
    },
    responseBody: FindCloudDeviceByIdResponseDto,
  }),

  rentalCloudDevice: new ControllerMethodSpec({
    controllerSpec: CloudDeviceController,
    method: 'POST',
    path: '/:cloudDeviceId/rental',
    pathProvider: class {
      constructor(readonly cloudDeviceId: CloudDeviceId) {}
    },
    requestBody: RentalCloudDeviceRequestDto,
    responseBody: RentalCloudDeviceResponseDto,
  }),
};
