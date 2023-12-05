import { FindOrganizationApplicationByPackageNameDtoBase, FindOrganizationApplicationDtoBase } from '@dogu-private/console';
import { TransformBooleanString } from '@dogu-tech/common';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

import { PageDto } from '../../common/dto/pagination/page.dto';

export class FindOrganizationApplicationDto extends PageDto implements FindOrganizationApplicationDtoBase {
  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsBoolean()
  @TransformBooleanString()
  latestOnly?: boolean;

  @IsOptional()
  @IsString()
  extension?: string;
}

export class FindOrganizationApplicationByPackageNameDto extends PageDto implements FindOrganizationApplicationByPackageNameDtoBase {
  @IsOptional()
  @IsString()
  extension?: string;
}
