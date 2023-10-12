import { DeviceId, LiveSessionState, OrganizationId } from '@dogu-private/types';
import { IsFilledString } from '@dogu-tech/common';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class LiveSessionFindQueryDto {
  /**
   * @description demanded organization
   */
  @IsUUID()
  organizationId!: OrganizationId;

  /**
   * @description acquired device
   */
  @IsUUID()
  @IsOptional()
  deviceId?: DeviceId;

  @IsEnum(LiveSessionState)
  @IsOptional()
  state?: LiveSessionState;
}

export class LiveSessionCreateRequestBodyDto {
  /**
   * @description demanded organization
   */
  @IsUUID()
  organizationId!: OrganizationId;

  @IsFilledString()
  deviceModel!: string;

  @IsFilledString()
  deviceVersion!: string;
}
