import { AdminToken } from '@dogu-tech/device-client-common';
import { v4 as uuidv4 } from 'uuid';

export class DeviceAuthService {
  private _adminToken: AdminToken;

  get adminToken(): AdminToken {
    return this._adminToken;
  }

  constructor() {
    this._adminToken = new AdminToken(uuidv4());
  }

  refreshAdminToken(): void {
    this._adminToken = new AdminToken(uuidv4());
  }
}
