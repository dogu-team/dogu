import { IsFilledString } from '@dogu-tech/common';

export class DeviceAdminToken {
  constructor(value: string) {
    this.value = value;
  }

  @IsFilledString()
  value!: string;
}
export class DeviceTemporaryToken {
  constructor(value: string) {
    this.value = value;
  }
  @IsFilledString()
  value!: string;
}
