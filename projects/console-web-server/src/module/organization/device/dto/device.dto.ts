import {
  AttachTagToDeviceDtoBase,
  DeviceStateDtoBase,
  DeviceStreamingOffer,
  EnableDeviceDtoBase,
  FindAddableDevicesByOrganizationIdDtoBase,
  FindDevicesByOrganizationIdDtoBase,
  MAX_PROJECT_IDS_FILTER_LENGTH,
  MAX_TAG_NAMES_FILTER_LENGTH,
  UpdateDeviceDtoBase,
  UpdateDeviceMaxParallelJobsDtoBase,
} from '@dogu-private/console';
import {
  DeviceConnectionState,
  DeviceTagId,
  DEVICE_MAX_PARALLEL_JOBS_MAX,
  DEVICE_MAX_PARALLEL_JOBS_MIN,
  DEVICE_NAME_MAX_LENGTH,
  DEVICE_NAME_MIN_LENGTH,
  OrganizationId,
  ProjectId,
} from '@dogu-private/types';
import { TransformByCase } from '@dogu-tech/common';
import { StreamingOfferValue } from '@dogu-tech/device-client-common';
import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';
import { PageDto } from '../../../common/dto/pagination/page.dto';

export class AttachTagToDeviceDto implements AttachTagToDeviceDtoBase {
  @IsNotEmpty()
  @IsNumber()
  tagId!: DeviceTagId;
}

export class DeviceStateDto implements DeviceStateDtoBase {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  connectionState?: DeviceConnectionState;
}

export class FindDevicesByOrganizationIdDto extends PageDto implements FindDevicesByOrganizationIdDtoBase {
  @IsOptional()
  @IsString()
  @Type(() => String)
  deviceName = '';

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_TAG_NAMES_FILTER_LENGTH)
  @IsString({ each: true })
  @Transform(({ value }: { value: string }) => {
    return value
      .trim()
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  })
  tagNames: string[] = [];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }: { value: string }) => {
    return value
      .trim()
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  })
  connectionStates: DeviceConnectionState[] = [];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_PROJECT_IDS_FILTER_LENGTH)
  @IsString({ each: true })
  @Transform(({ value }: { value: string }) => {
    return value
      .trim()
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  })
  projectIds: string[] = [];

  @IsOptional()
  @IsString()
  hostId?: string;

  // for cookapps
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }: { value: string }) => {
    return value
      .trim()
      .split(',')
      .map((s) => s.trim());
  })
  excludeHostIds: string[] = [];
}

export class FindAddableDevicesByOrganizationIdDto extends PageDto implements FindAddableDevicesByOrganizationIdDtoBase {
  @IsOptional()
  @IsString()
  deviceName = '';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }: { value: string }) => {
    return value
      .trim()
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  })
  connectionStates?: DeviceConnectionState[] = [];

  @IsOptional()
  @IsString()
  hostId?: string;
}

export class UpdateDeviceDto implements UpdateDeviceDtoBase {
  @IsOptional()
  @IsString()
  @MinLength(DEVICE_NAME_MIN_LENGTH)
  @MaxLength(DEVICE_NAME_MAX_LENGTH)
  name?: string;
}

export class UpdateDeviceMaxParallelJobsDto implements UpdateDeviceMaxParallelJobsDtoBase {
  @Min(DEVICE_MAX_PARALLEL_JOBS_MIN)
  @Max(DEVICE_MAX_PARALLEL_JOBS_MAX)
  @IsNumber()
  @IsOptional()
  maxParallelJobs!: number;
}

export class EnableDeviceDto implements EnableDeviceDtoBase {
  @IsNotEmpty()
  @IsBoolean()
  isGlobal!: boolean;

  // @ExclusiveDeviceEnableOption()
  @IsOptional()
  @IsString()
  projectId?: ProjectId;
}

export class DeviceStreamingOfferDto implements DeviceStreamingOffer {
  @IsUUID()
  organizationId!: OrganizationId;

  @IsUUID()
  deviceId!: string;

  @IsString()
  @IsNotEmpty()
  serial!: string;

  @ValidateNested()
  @TransformByCase(StreamingOfferValue)
  value!: StreamingOfferValue;
}
