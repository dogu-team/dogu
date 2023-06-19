import { CreateDeviceTagDtoBase, FindDeviceTagsByOrganizationIdDtoBase, UpdateDeviceTagDtoBase } from '@dogu-private/console';
import { DEVICE_TAG_NAME_MAX_LENGTHC, DEVICE_TAG_NAME_MIN_LENGTH } from '@dogu-private/types';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PageDto } from '../../../common/dto/pagination/page.dto';

export class CreateDeviceTagDto implements CreateDeviceTagDtoBase {
  @IsNotEmpty()
  @IsString()
  @MinLength(DEVICE_TAG_NAME_MIN_LENGTH)
  @MaxLength(DEVICE_TAG_NAME_MAX_LENGTHC)
  name!: string;
}

export class FindDeviceTagsByOrganizationIdDto extends PageDto implements FindDeviceTagsByOrganizationIdDtoBase {
  @IsOptional()
  @IsString()
  keyword = '';
}

export class UpdateDeviceTagDto implements UpdateDeviceTagDtoBase {
  @IsNotEmpty()
  @IsString()
  @MinLength(DEVICE_TAG_NAME_MIN_LENGTH)
  @MaxLength(DEVICE_TAG_NAME_MAX_LENGTHC)
  name!: string;
}
