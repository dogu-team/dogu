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
} from '@dogu-private/console';
import { DeviceConnectionState, DeviceTagId, DEVICE_NAME_MAX_LENGTH, DEVICE_NAME_MIN_LENGTH, HostId, OrganizationId, ProjectId } from '@dogu-private/types';
import { TransformByCase } from '@dogu-tech/common';
import { StreamingOfferValue } from '@dogu-tech/device-client-common';
import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { PageDto } from '../../../common/dto/pagination/page.dto';

// import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

// @ValidatorConstraint({ async: false })
// export class IsExclusive implements ValidatorConstraintInterface {
//   validate(value: any, args: ValidationArguments) {
//     const [relatedPropertyName] = args.constraints;
//     const relatedValue = (args.object as any)[relatedPropertyName];
//     if (value && relatedValue) {
//       return false;
//     }
//     return true;
//   }

//   defaultMessage(args: ValidationArguments) {
//     const [relatedPropertyName] = args.constraints;
//     return `${relatedPropertyName} and ${args.property} cannot both be set`;
//   }
// }

// export function ExclusiveDeviceEnableOption(validationOptions?: ValidationOptions) {
//   return function (object: Object, propertyName: string) {
//     registerDecorator({
//       target: object.constructor,
//       propertyName: propertyName,
//       options: validationOptions,
//       constraints: [DevicePropCamel.isGlobal],
//       validator: IsExclusive,
//     });
//   };
// }

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
}

export class UpdateDeviceDto implements UpdateDeviceDtoBase {
  @IsOptional()
  @IsString()
  hostId?: HostId;

  @IsOptional()
  @IsNumber()
  connectionState?: DeviceConnectionState;

  @IsOptional()
  @IsString()
  @MinLength(DEVICE_NAME_MIN_LENGTH)
  @MaxLength(DEVICE_NAME_MAX_LENGTH)
  name?: string;
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
