import { IsFilledString } from '@dogu-tech/common';
import { DeviceTemporaryToken } from '..';

export class DeviceAdminToken {
  constructor(value: string) {
    this.value = value;
  }

  @IsFilledString()
  value!: string;
}

export class DeviceTemporaryTokenDto implements DeviceTemporaryToken {
  constructor(value: string) {
    this.value = value;
  }
  @IsFilledString()
  value!: string;
}
