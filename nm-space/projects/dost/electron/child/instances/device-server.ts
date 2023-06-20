import { ChildProcess } from 'child_process';
import { app } from 'electron';
import { deviceServerKey } from '../../../src/shares/child';
import { AppConfigService } from '../../app-config/app-config-service';
import { DeviceServerLogsPath, DeviceServerMainScriptPath } from '../../path-map';
import { ChildFactory } from '../child-factory';
import { ChildService } from '../child-service';
import { Child, fillChildOptions } from '../types';

export class DeviceServerChild implements Child {
  constructor(private readonly childFactory: ChildFactory, private readonly appConfigService: AppConfigService, private readonly childService: ChildService) {}

  async open(): Promise<ChildProcess> {
    const { appConfigService } = this;
    const NODE_ENV = await appConfigService.get('NODE_ENV');
    const DOGU_RUN_TYPE = await appConfigService.get('DOGU_RUN_TYPE');
    const DOGU_DEVICE_SERVER_PORT = await appConfigService.get('DOGU_DEVICE_SERVER_PORT');
    const options = await fillChildOptions({
      forkOptions: {
        env: {
          ...process.env,
          NODE_ENV,
          DOGU_RUN_TYPE,
          DOGU_DEVICE_SERVER_PORT,
          DOGU_LOGS_PATH: DeviceServerLogsPath,
        },
      },
    });
    const child = this.childService.open(deviceServerKey, DeviceServerMainScriptPath, options);
    child.on('close', (code, signal) => {
      if (code !== null) {
        if (code === 0) {
          return;
        } else {
          this.childFactory.open('device-server');
        }
      }
    });
    return child;
  }

  async openable(): Promise<boolean> {
    const doguIsSupportedPlatformValid = await this.appConfigService.get<boolean>('DOGU_IS_SUPPORTED_PLATFORM_VALID');
    return doguIsSupportedPlatformValid;
  }

  setOnChangeHandler(): void {
    const { appConfigService } = this;
    const reopen = async () => {
      const isActive = await this.childService.isActive('device-server');
      if (isActive) {
        await this.childService.close('device-server');
      }
      return this.childFactory.open('device-server');
    };
    appConfigService.client.onDidChange('NODE_ENV', reopen);
    appConfigService.client.onDidChange('DOGU_RUN_TYPE', reopen);
    appConfigService.client.onDidChange('DOGU_DEVICE_SERVER_PORT', reopen);
    appConfigService.client.onDidChange('DOGU_IS_SUPPORTED_PLATFORM_VALID', (newValue) => {
      if (newValue) {
        reopen();
      }
    });
  }
}
