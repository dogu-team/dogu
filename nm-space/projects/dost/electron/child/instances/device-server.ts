import { isFreePort } from '@dogu-private/device-server';
import { ChildCode } from '@dogu-private/dost-children';
import { Code } from '@dogu-private/types';
import { delay } from '@dogu-tech/common';
import { HostPaths, killProcessOnPort } from '@dogu-tech/node';
import { ChildProcess } from 'child_process';
import path from 'path';
import { deviceServerKey } from '../../../src/shares/child';
import { AppConfigService } from '../../app-config/app-config-service';
import { FeatureConfigService } from '../../feature-config/feature-config-service';
import { getLogLevel, logger } from '../../log/logger.instance';
import { stripAnsi } from '../../log/strip-ansi';
import { DeviceServerLogsPath, DeviceServerMainScriptPath } from '../../path-map';
import { Child, ChildLastError, fillChildOptions } from '../types';
import { closeChild, openChild } from './lifecycle';

export class DeviceServerChild implements Child {
  constructor(private readonly appConfigService: AppConfigService, private readonly featureConfigService: FeatureConfigService) {}
  private _child: ChildProcess | undefined;
  private _lastError: ChildLastError = { code: new ChildCode(Code.CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED), message: '' };

  async port(): Promise<number> {
    const DOGU_DEVICE_SERVER_PORT = await this.appConfigService.get('DOGU_DEVICE_SERVER_PORT');
    if (!DOGU_DEVICE_SERVER_PORT) {
      throw new Error('DOGU_DEVICE_SERVER_PORT not exist');
    }
    return DOGU_DEVICE_SERVER_PORT;
  }

  async open(): Promise<void> {
    const { appConfigService } = this;
    const NODE_ENV = await appConfigService.get('NODE_ENV');
    const DOGU_RUN_TYPE = await appConfigService.get('DOGU_RUN_TYPE');
    const DOGU_DEVICE_SERVER_PORT = await appConfigService.get('DOGU_DEVICE_SERVER_PORT');
    const DOGU_LOG_LEVEL = getLogLevel(DOGU_RUN_TYPE);
    await killProcessOnPort(DOGU_DEVICE_SERVER_PORT, logger).catch((err) => {
      logger.error('killProcessOnPort', { err });
    });
    logger.info(`DeviceServerChild DOGU_LOG_LEVEL: ${DOGU_LOG_LEVEL}`);
    const androidHomePath = process.env.ANDROID_HOME;
    if (!androidHomePath) {
      throw new Error('ANDROID_HOME not exist');
    }
    const androidPlatformToolsPath = HostPaths.android.platformToolsPath(androidHomePath);
    const PATH = `${androidPlatformToolsPath}${path.delimiter}${process.env.PATH}`;
    const options = await fillChildOptions({
      forkOptions: {
        env: {
          ...process.env,
          NODE_ENV,
          DOGU_RUN_TYPE,
          DOGU_DEVICE_SERVER_PORT,
          DOGU_LOGS_PATH: DeviceServerLogsPath,
          PATH,
          DOGU_LOG_LEVEL,
        },
      },
      childLogger: logger,
    });
    this._child = openChild(deviceServerKey, DeviceServerMainScriptPath, options, this.featureConfigService);
    this._child.stderr?.on('data', (data) => {
      const dataString = data.toString();
      const stripped = stripAnsi(dataString);
      this._lastError.message = stripped;
    });
    this._child.on('close', (code, signal) => {
      if (code !== null) {
        if (code === 0) {
          return;
        } else {
          this._child = undefined;
          delay(3000).then(() => {
            this.open();
          });
        }
      }
    });
  }

  async openable(): Promise<boolean> {
    const doguIsSupportedPlatformValid = await this.appConfigService.get<boolean>('DOGU_IS_SUPPORTED_PLATFORM_VALID');
    return doguIsSupportedPlatformValid;
  }

  async close(): Promise<void> {
    if (!this._child) {
      return;
    }
    await closeChild(deviceServerKey, this._child, logger);
    this._child = undefined;
  }

  async isActive(): Promise<boolean> {
    if (!this._child) {
      return false;
    }
    const DOGU_DEVICE_SERVER_PORT = await this.appConfigService.get('DOGU_DEVICE_SERVER_PORT');
    if (!DOGU_DEVICE_SERVER_PORT) {
      return false;
    }
    const isFree = await isFreePort(DOGU_DEVICE_SERVER_PORT);
    if (isFree) {
      return false;
    }
    return true;
  }

  lastError(): ChildLastError | undefined {
    return this._lastError;
  }
}
