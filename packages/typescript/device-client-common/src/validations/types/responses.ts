import { Caseable, IsOptionalObject, TransformByCase } from '@dogu-tech/common';
import { DeviceServerResponse, ErrorResult, ErrorResultDto, Serial } from '@dogu-tech/types';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class DeviceServerResponseError extends Caseable<'error'> {
  @ValidateNested()
  @Type(() => ErrorResultDto)
  error!: ErrorResultDto;
}

export class DeviceServerResponseData<T extends object = object> extends Caseable<'data'> {
  @IsOptionalObject()
  data!: T | undefined;
}

const DeviceServerResponseValue = [DeviceServerResponseError, DeviceServerResponseData] as const;
export type DeviceServerResponseValue<T extends object = object> = DeviceServerResponseError | DeviceServerResponseData<T>;

export class DeviceServerResponseDto<T extends object = object> implements DeviceServerResponse {
  @ValidateNested()
  @TransformByCase(DeviceServerResponseValue)
  value!: DeviceServerResponseValue<T>;
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
