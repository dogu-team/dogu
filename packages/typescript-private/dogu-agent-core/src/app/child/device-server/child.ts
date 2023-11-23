import { ChildCode } from '@dogu-private/dost-children';
import { isValidDoguRunType } from '@dogu-private/types';
import { delay, errorify, Printable, stringify } from '@dogu-tech/common';
import { HostPaths, isFreePort, killProcessOnPort } from '@dogu-tech/node';
import { Code } from '@dogu-tech/types';
import { ChildProcess } from 'child_process';
import EventEmitter from 'events';
import path from 'path';
import { deviceServerKey } from '../../../shares/child';
import { AppConfigService } from '../../app-config/service';
import { DeviceAuthService } from '../../device-auth/service';
import { ExternalService } from '../../external/service';
import { FeatureConfigService } from '../../index';
import { getLogLevel, stripAnsi } from '../../log-utils';
import { checkProjectEqual } from '../../settings/ios-device-agent-project';
import { closeChild, openChild } from '../lifecycle';
import { Child, ChildLastError, ChildListener, fillChildOptions } from '../types';

const deviceServerMainScriptPath = path.resolve(__dirname, 'main.js');

export class DeviceServerChild implements Child {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly featureConfigService: FeatureConfigService,
    private readonly externalService: ExternalService,
    private readonly authService: DeviceAuthService,
    private readonly logsPath: string,
    private readonly listener: ChildListener,
    private readonly logger: Printable,
  ) {}
  public eventEmitter: NodeJS.EventEmitter = new EventEmitter();
  private _child: ChildProcess | undefined;
  private _lastError: ChildLastError = { code: new ChildCode(Code.CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED), message: '' };

  async open(): Promise<void> {
    const { appConfigService } = this;
    const NODE_ENV = appConfigService.get<string>('NODE_ENV');
    const DOGU_RUN_TYPE = appConfigService.get<string>('DOGU_RUN_TYPE');
    const DOGU_DEVICE_SERVER_PORT = appConfigService.get<number>('DOGU_DEVICE_SERVER_PORT');
    const DOGU_DEVICE_PLATFORM_ENABLED = appConfigService.get<string>('DOGU_DEVICE_PLATFORM_ENABLED');
    const DOGU_DEVICE_RESTART_IOS_ON_INIT = appConfigService.getOrDefault<boolean>('DOGU_DEVICE_RESTART_IOS_ON_INIT', true);
    const DOGU_DEVICE_IS_SHAREABLE = appConfigService.getOrDefault<boolean>('DOGU_DEVICE_IS_SHAREABLE', false);
    const DOGU_DEVICE_IOS_IS_IDAPROJECT_VALIDATED = await checkProjectEqual(this.logger).catch(() => false);
    const DOGU_LINUX_DEVICE_SERIAL = appConfigService.getOrDefault<string>('DOGU_LINUX_DEVICE_SERIAL', '');
    const DOGU_WIFI_SSID = appConfigService.getOrDefault<string>('DOGU_WIFI_SSID', '');
    const DOGU_WIFI_PASSWORD = appConfigService.getOrDefault<string>('DOGU_WIFI_PASSWORD', '');
    const DOGU_USE_SENTRY = this.featureConfigService.get('useSentry');

    if (!isValidDoguRunType(DOGU_RUN_TYPE)) {
      throw new Error(`Invalid DOGU_RUN_TYPE: ${DOGU_RUN_TYPE}`);
    }
    const DOGU_LOG_LEVEL = getLogLevel(DOGU_RUN_TYPE, appConfigService);
    await killProcessOnPort(DOGU_DEVICE_SERVER_PORT, this.logger).catch((err) => {
      this.logger.error('killProcessOnPort', { error: errorify(err) });
    });
    this.logger.info(`DeviceServerChild DOGU_LOG_LEVEL: ${DOGU_LOG_LEVEL}`);
    const androidHomePath = process.env.ANDROID_HOME;
    if (!androidHomePath) {
      throw new Error('ANDROID_HOME not exist');
    }
    const deviceServerLogsPath = path.join(this.logsPath, 'device-server');
    const androidPlatformToolsPath = HostPaths.android.platformToolsPath(androidHomePath);
    const PATH = `${androidPlatformToolsPath}${path.delimiter}${process.env.PATH || ''}`;
    const options = await fillChildOptions({
      forkOptions: {
        env: {
          ...process.env,
          NODE_ENV,
          DOGU_RUN_TYPE,
          DOGU_DEVICE_SERVER_PORT: `${DOGU_DEVICE_SERVER_PORT}`,
          DOGU_LOGS_PATH: deviceServerLogsPath,
          PATH,
          DOGU_LOG_LEVEL,
          DOGU_DEVICE_PLATFORM_ENABLED,
          DOGU_DEVICE_RESTART_IOS_ON_INIT: DOGU_DEVICE_RESTART_IOS_ON_INIT ? 'true' : 'false',
          DOGU_DEVICE_IOS_IS_IDAPROJECT_VALIDATED: DOGU_DEVICE_IOS_IS_IDAPROJECT_VALIDATED ? 'true' : 'false',
          DOGU_DEVICE_IS_SHAREABLE: DOGU_DEVICE_IS_SHAREABLE ? 'true' : 'false',
          DOGU_LINUX_DEVICE_SERIAL,
          DOGU_WIFI_SSID,
          DOGU_WIFI_PASSWORD,
          DOGU_USE_SENTRY: DOGU_USE_SENTRY ? 'true' : 'false',
          DOGU_SECRET_INITIAL_ADMIN_TOKEN: this.authService.adminToken.value,
        },
      },
      childLogger: this.logger,
    });
    this._child = openChild(deviceServerKey, deviceServerMainScriptPath, options, this.listener);
    this._child.on('spawn', () => {
      this.eventEmitter.emit('spawn');
    });
    this._child.stderr?.on('data', (data) => {
      const dataString = stringify(data);
      const stripped = stripAnsi(dataString);
      this._lastError.message = stripped;
    });
    this._child.on('close', (code, signal) => {
      this.logger.error('DeviceServerChild close critical error!!', { code, signal });

      this.eventEmitter.emit('close');
      if (code !== null) {
        if (code === 0) {
          return;
        } else {
          this._child = undefined;
          delay(3000)
            .then(() => {
              this.open().catch((error) => {
                this.logger.error('DeviceServerChild delay open', { error: errorify(error) });
              });
            })
            .catch((error) => {
              this.logger.error('DeviceServerChild delay', { error: errorify(error) });
            });
        }
      }
    });
  }

  async openable(): Promise<boolean> {
    const isSupportedPlatformValid = await this.externalService.updateIsSupportedPlatformValid();
    return isSupportedPlatformValid;
  }

  async close(): Promise<void> {
    if (!this._child) {
      return;
    }
    await closeChild(deviceServerKey, this._child, this.logger);
    this._child = undefined;
  }

  async isActive(): Promise<boolean> {
    if (!this._child) {
      return false;
    }
    const DOGU_DEVICE_SERVER_PORT = this.appConfigService.get<number>('DOGU_DEVICE_SERVER_PORT');
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
