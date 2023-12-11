import { Serial } from '@dogu-private/types';
import { IsFilledString } from '@dogu-tech/common';
import { RuntimeInfoDto } from '@dogu-tech/device-client-common';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class DeviceRuntimeInfo {
  @IsFilledString()
  serial!: Serial;

  @ValidateNested()
  @Type(() => RuntimeInfoDto)
  runtimeInfo!: RuntimeInfoDto;
}
