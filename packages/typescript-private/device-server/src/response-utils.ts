import { Code, Serial } from '@dogu-private/types';
import { AppiumChannelKey, DeviceServerResponseDto } from '@dogu-tech/device-client-common';

export function appiumChannelNotFoundError(serial: Serial, key: AppiumChannelKey): DeviceServerResponseDto {
  return {
    value: {
      $case: 'error',
      error: {
        code: Code.CODE_DEVICE_SERVER_APPIUM_CHANNEL_NOT_FOUND,
        message: `Appium channel not found for key: ${key}`,
        details: {
          serial,
          key,
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
