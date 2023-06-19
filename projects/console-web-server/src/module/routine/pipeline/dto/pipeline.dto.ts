import { CreateInstantPipelineDtoBase, CreatePipelineDtoBase, FindAllPipelinesDtoBase } from '@dogu-private/console';
import { PIPELINE_STATUS, ROUTINE_CONFIG_URL_MAX_LENGTH } from '@dogu-private/types';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import { PageDto } from '../../../common/dto/pagination/page.dto';

export class CreatePipelineDto implements CreatePipelineDtoBase {
  @IsNotEmpty()
  @IsString()
  @MaxLength(ROUTINE_CONFIG_URL_MAX_LENGTH)
  configUrl!: string;

  @IsOptional()
  @IsString()
  @MaxLength(ROUTINE_CONFIG_URL_MAX_LENGTH)
  description = '';
}

export class CreateInstantPipelineDto implements CreateInstantPipelineDtoBase {
  @IsNotEmpty()
  @IsString()
  scriptPath!: string;

  @IsOptional()
  @IsString()
  appVersion?: string;

  @IsNotEmpty()
  @IsString()
  deviceName!: string;
}
export class FindAllPipelinesDto extends PageDto implements FindAllPipelinesDtoBase {
  @IsOptional()
  @IsString()
  routine?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }: { value: string }) => {
    return value
      ? value
          .trim()
          .split(',')
          .map((item) => Number(item))
      : [];
  })
  @IsEnum(PIPELINE_STATUS, { each: true })
  status?: PIPELINE_STATUS[];
}
