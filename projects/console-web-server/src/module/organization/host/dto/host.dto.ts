import { CreateHostDtoBase, FindHostsByOrganizationIdDtoBase, UpdateHostNameDtoBase } from '@dogu-private/console';
import { HOST_NAME_MAX_LENGTH, HOST_NAME_MIN_LENGTH } from '@dogu-private/types';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PageDto } from '../../../common/dto/pagination/page.dto';

export class CreateHostDto implements CreateHostDtoBase {
  @IsNotEmpty()
  @IsString()
  @MinLength(HOST_NAME_MIN_LENGTH)
  @MaxLength(HOST_NAME_MAX_LENGTH)
  name!: string;

  // @IsOptional()
  // @IsDate()
  // @Type(() => Date)
  // expiredTime?: Date;
}

export class FindHostsByOrganizationIdDto extends PageDto implements FindHostsByOrganizationIdDtoBase {
  @IsOptional()
  @IsString()
  @Type(() => String)
  keyword = '';
}

export class UpdateHostNameDto implements UpdateHostNameDtoBase {
  @IsOptional()
  @IsString()
  @MinLength(HOST_NAME_MIN_LENGTH)
  @MaxLength(HOST_NAME_MAX_LENGTH)
  name!: string;
}
