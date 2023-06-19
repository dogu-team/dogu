import { DeviceStreamingQueryDtoBase } from '@dogu-private/console';
import { DeviceId, OrganizationId } from '@dogu-private/types';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeviceStreamingQueryDto implements DeviceStreamingQueryDtoBase {
  @IsNotEmpty()
  @IsUUID()
  organizationId!: OrganizationId;

  @IsNotEmpty()
  @IsUUID()
  deviceId!: DeviceId;
}
