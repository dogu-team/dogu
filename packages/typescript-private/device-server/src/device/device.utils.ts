import { Code, Serial } from '@dogu-private/types';
import { DeviceServerResponseDto } from '@dogu-tech/device-client-common';

export function deviceNotFoundError(serial: Serial): DeviceServerResponseDto {
  return {
    value: {
      $case: 'error',
      error: {
        code: Code.CODE_DEVICE_SERVER_DEVICE_NOT_FOUND,
        message: `Device with serial ${serial} not found`,
        details: { serial },
      },
    },
  };
}
