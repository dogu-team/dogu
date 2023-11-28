import { IsFilledString } from '@dogu-tech/common';
import { DeviceServerToken } from '..';

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
