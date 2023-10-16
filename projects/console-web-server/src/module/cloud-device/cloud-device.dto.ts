import { FindCloudDevicesDtoBase } from '@dogu-private/console';
import { Platform } from '@dogu-private/types';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { PageDto } from '../common/dto/pagination/page.dto';

export class FindCloudDevicesDto extends PageDto implements FindCloudDevicesDtoBase {
  @IsString()
  keyword = '';

  @IsOptional()
  @IsEnum(Platform)
  @Type(() => Number)
  platform?: Platform;

  @IsString()
  version = '';
}
