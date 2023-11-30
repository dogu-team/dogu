import { IsFilledString } from '@dogu-tech/common';
import { DeviceServerToken } from '..';

export const DOGU_DEVICE_AUTHORIZATION_HEADER_KEY = 'dogu-device-authorization';
export const DOGU_DEVICE_SERIAL_HEADER_KEY = 'dogu-device-serial';

export class DeviceAdminToken implements DeviceServerToken {
  constructor(value: string) {
    this.value = value;
  }

  @IsFilledString()
  value!: string;
}

export class DeviceTemporaryToken implements DeviceServerToken {
  constructor(value: string) {
    this.value = value;
  }
  @IsFilledString()
  value!: string;
}
