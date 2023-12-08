import { Code, Serial } from '@dogu-private/types';
import { DeviceServerResponseDto } from '@dogu-tech/device-client-common';

export function appiumContextNotFoundError(serial: Serial): DeviceServerResponseDto {
  return {
    value: {
      $case: 'error',
      error: {
        code: Code.CODE_DEVICE_SERVER_APPIUM_CONTEXT_NOT_FOUND,
        message: 'Appium context not found',
        details: {
          serial,
        },
      },
    },
  };
}

export function appiumCapabilitiesNotFoundError(serial: Serial): DeviceServerResponseDto {
  return {
    value: {
      $case: 'error',
      error: {
        code: Code.CODE_DEVICE_SERVER_APPIUM_CONTEXT_NOT_FOUND,
        message: 'Appium context not found',
        details: {
          serial,
        },
      },
    },
  };
}

export function gamiumContextNotFoundError(serial: Serial): DeviceServerResponseDto {
  return {
    value: {
      $case: 'error',
      error: {
        code: Code.CODE_DEVICE_SERVER_GAMIUM_CONTEXT_NOT_FOUND,
        message: 'Gamium context not found',
        details: {
          serial,
        },
      },
    },
  };
}
