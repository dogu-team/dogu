import {
  CloudDevice,
  CloudDevicePropCamel,
  FindAllCloudDeviceResponseDto,
  FindCloudDeviceByIdResponseDto,
  RentalCloudDeviceRequestDto,
  RentalCloudDeviceResponseDto,
} from '@dogu-private/console';
import { CloudDeviceId, UserPayload } from '@dogu-private/types';
import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { User } from '../auth/decorators';
import { CloudDeviceService } from './cloud-device.service';

@Controller(CloudDevice.controller.path)
export class CloudDeviceController {
  constructor(
    @Inject(CloudDeviceService)
    private readonly cloudDeviceService: CloudDeviceService,
  ) {}

  @Get(CloudDevice.findAllCloudDevice.path)
  // @EmailVerification(EMAIL_VERIFICATION.VERIFIED)
  async findAllCloudDevice(): Promise<FindAllCloudDeviceResponseDto> {
    const rv = await this.cloudDeviceService.findAllCloudDevice();
    return rv;
  }

  @Get(CloudDevice.findCloudDeviceById.path)
  // @EmailVerification(EMAIL_VERIFICATION.VERIFIED)
  async findCloudDeviceById(@Param(CloudDevicePropCamel.cloudDeviceId) cloudDeviceId: CloudDeviceId): Promise<FindCloudDeviceByIdResponseDto> {
    const rv = await this.cloudDeviceService.findCloudDeviceById(cloudDeviceId);
    return rv;
  }

  @Post(CloudDevice.rentalCloudDevice.path)
  // @EmailVerification(EMAIL_VERIFICATION.VERIFIED)
  // org admin guard
  async rentalCloudDevice(
    @Param(CloudDevicePropCamel.cloudDeviceId) cloudDeviceId: CloudDeviceId, //
    @User() userPayload: UserPayload,
    @Body() dto: RentalCloudDeviceRequestDto,
  ): Promise<RentalCloudDeviceResponseDto> {
    // const userId = userPayload.userId;
    const userId = 'bc64afae-1719-4537-acc7-1a8002b30bc0';

    const rv = await this.cloudDeviceService.rentalCloudDevice(cloudDeviceId, userId, dto);
    return rv;
  }
}
