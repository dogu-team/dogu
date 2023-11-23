import { DeviceAdminToken } from '@dogu-private/types';
import { v4 as uuidv4 } from 'uuid';

export class DeviceAuthService {
  private _adminToken: DeviceAdminToken;

  get adminToken(): DeviceAdminToken {
    return this._adminToken;
  }

  constructor() {
    this._adminToken = new DeviceAdminToken(uuidv4());
  }

  refreshAdminToken(): void {
    this._adminToken = new DeviceAdminToken(uuidv4());
  }
}
