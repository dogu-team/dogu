import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Caseable, TransformByCase } from '../../common/case-kinds.js';
import { IsOptionalObject } from '../../common/decorators.js';
import { ErrorResultDto } from '../../types/errors.js';
import { Serial } from '../../types/types.js';

export class DeviceServerResponseError extends Caseable<'error'> {
  @ValidateNested()
  @Type(() => ErrorResultDto)
  error!: ErrorResultDto;
}

export class DeviceServerResponseData extends Caseable<'data'> {
  @IsOptionalObject()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data!: Record<string, any> | undefined;
}

const DeviceServerResponseValue = [DeviceServerResponseError, DeviceServerResponseData] as const;
export type DeviceServerResponseValue = InstanceType<(typeof DeviceServerResponseValue)[number]>;

export class DeviceServerResponseDto {
  @ValidateNested()
  @TransformByCase(DeviceServerResponseValue)
  value!: DeviceServerResponseValue;
}

export class DeviceServerResponseFactory {
  static fromError(error: ErrorResultDto): DeviceServerResponseDto {
    return {
      value: {
        $case: 'error',
        error,
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromData(data: Record<string, any>): DeviceServerResponseDto {
    return {
      value: {
        $case: 'data',
        data,
      },
    };
  }

  static fromEmptyData(): DeviceServerResponseDto {
    return this.fromData({});
  }
}

export class DeviceNotFoundErrorDetails {
  @IsString()
  @IsNotEmpty()
  serial!: Serial;
}
