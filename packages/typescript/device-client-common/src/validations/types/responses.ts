import { Caseable, IsOptionalObject, TransformByCase } from '@dogu-tech/common';
import { DeviceServerResponse, ErrorResult, ErrorResultDto, Serial } from '@dogu-tech/types';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

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

export class DeviceServerResponseDto implements DeviceServerResponse {
  @ValidateNested()
  @TransformByCase(DeviceServerResponseValue)
  value!: DeviceServerResponseValue;
}

export class DeviceServerResponseFactory {
  static fromError(error: ErrorResult): DeviceServerResponse {
    return {
      value: {
        $case: 'error',
        error,
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromData(data: Record<string, any>): DeviceServerResponse {
    return {
      value: {
        $case: 'data',
        data,
      },
    };
  }

  static fromEmptyData(): DeviceServerResponse {
    return this.fromData({});
  }
}

export class DeviceNotFoundErrorDetails {
  @IsString()
  @IsNotEmpty()
  serial!: Serial;
}
