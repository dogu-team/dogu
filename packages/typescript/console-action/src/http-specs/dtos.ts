import { IsFilledString, TransformBooleanString } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class GetGitUrlQuery {
  @IsFilledString()
  repository!: string;
}

export class GetGitUrlResponse {
  @IsFilledString()
  url!: string;
}

export class GetApplicationListQuery {
  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsBoolean()
  @TransformBooleanString()
  latestOnly?: boolean;

  @IsFilledString()
  extension!: string;
}

export class GetApplicationsWithUniquePackageQuery {
  @IsFilledString()
  packageName!: string;

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

export class Application {
  @IsFilledString()
  id!: string;

  @IsFilledString()
  name!: string;

  @IsFilledString()
  fileName!: string;

  @IsFilledString()
  packageName!: string;

  @IsNumber()
  @Type(() => Number)
  fileSize!: number;
}

export class GetApplicationListResponse {
  @ValidateNested()
  @Type(() => Application)
  applications!: Application[];
}

export class GetApplicationUrlResponse {
  @IsFilledString()
  url!: string;
}
