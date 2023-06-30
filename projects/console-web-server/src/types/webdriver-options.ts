import { IsOptionalObject } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class DoguWebDriverAppOptions {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  version!: string;
}

export class DoguWebDriverOptions {
  @IsNotEmpty()
  @IsString()
  organizationId!: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsNotEmpty()
  @IsString()
  userName!: string;

  @IsNotEmpty()
  @IsString()
  accessKey!: string;

  @IsNotEmpty()
  @IsString()
  tag!: string;

  @IsOptionalObject()
  @ValidateNested()
  @Type(() => DoguWebDriverAppOptions)
  app?: DoguWebDriverAppOptions;
}
