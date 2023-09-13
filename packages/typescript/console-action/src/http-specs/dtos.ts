import { IsFilledString, TransformBooleanString } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, ValidateNested } from 'class-validator';

export class GetGitUrlResponse {
  @IsFilledString()
  url!: string;
}

export class GetApplicationListQuery {
  @IsOptional()
  @IsFilledString()
  version?: string;

  @IsOptional()
  @IsBoolean()
  @TransformBooleanString()
  latestOnly?: boolean;

  @IsFilledString()
  extension!: string;
}

export class Application {
  @IsNumber()
  id!: number;

  @IsFilledString()
  name!: string;

  @IsFilledString()
  fileName!: string;

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
