import {
  createLocaleCode,
  DefaultScreenCaptureOption,
  DeviceAlert,
  DeviceSystemInfo,
  DeviceWindowInfo,
  ErrorResult,
  FilledRuntimeInfo,
  findDeviceModelNameByModelId,
  GeoLocation,
  LocaleCode,
  Platform,
  PrivateProtocol,
  ProfileMethod,
  RuntimeInfo,
  ScreenCaptureOption,
  ScreenRecordOption,
  Serial,
  SerialPrintable,
  StreamingAnswer,
} from '@dogu-private/types';
import { Closable, errorify, MixedLogger, Printable, stringify } from '@dogu-tech/common';
import { AppiumCapabilities, BrowserInstallation, StreamingOfferDto } from '@dogu-tech/device-client-common';
import { checkTime, killChildProcess, killProcessOnPort } from '@dogu-tech/node';
import { ChildProcess } from 'child_process';
import fs from 'fs';
import lodash from 'lodash';
import { Observable } from 'rxjs';
import semver from 'semver';
import systeminformation from 'systeminformation';
import { createAppiumCapabilities } from '../../appium/appium.capabilites';
import { AppiumContext } from '../../appium/appium.context';
import { AppiumContextProxy, AppiumRemoteContextRental } from '../../appium/appium.context.proxy';
import { AppiumDeviceWebDriverHandler } from '../../device-webdriver/appium.device-webdriver.handler';
import { DeviceWebDriverHandler } from '../../device-webdriver/device-webdriver.common';
import { GamiumContext } from '../../gamium/gamium.context';
import { deviceInfoLogger } from '../../logger/logger.instance';
import { createAndroidLogger, SerialLogger } from '../../logger/serial-logger.instance';
import { AdbSerial, AppiumAdb } from '../externals';
import { getManifestFromApp } from '../externals/apk/apk-util';
import { DeviceChannel, DeviceChannelOpenParam, DeviceHealthStatus, DeviceServerService, LogHandler } from '../public/device-channel';
import { AndroidDeviceAgentService } from '../services/device-agent/android-device-agent-service';
import { AndroidAdbProfileService, AndroidDisplayProfileService } from '../services/profile/android-profiler';
import { ProfileServices } from '../services/profile/profile-service';
import { AndroidResetService } from '../services/reset/android-reset';
import { AndroidSharedDeviceService } from '../services/shared-device/android-shared-device';
import { StreamingService } from '../services/streaming/streaming-service';
import { AndroidSystemInfoService } from '../services/system-info/android-system-info-service';
import { Zombieable } from '../services/zombie/zombie-component';
import { ZombieServiceInstance } from '../services/zombie/zombie-service';

type DeviceControl = PrivateProtocol.DeviceControl;

export class AndroidLogClosable implements Closable {
  constructor(
    private readonly childProcess: ChildProcess,
    private readonly printable?: Printable,
  ) {}

  close(): void {
    killChildProcess(this.childProcess).catch((error) => {
      this.printable?.error?.('android logcat close failed', { error: errorify(error) });
    });
  }
}

export class AndroidChannel implements DeviceChannel {
  private _gamiumContext: GamiumContext | null = null;

  get serial(): string {
    return this._serial;
  }
  get serialUnique(): string {
    return this._serialUnique;
  }
  get platform(): Platform {
    return Platform.PLATFORM_ANDROID;
  }
  get info(): DeviceSystemInfo {
    return this._info;
  }
  get isVirtual(): boolean {
    return this._info.isVirtual;
  }

  protected constructor(
    private readonly _serial: Serial,
    private readonly _serialUnique: Serial,
    private readonly _info: DeviceSystemInfo,
    private readonly _systemInfoService: AndroidSystemInfoService,
    private readonly _deviceAgent: AndroidDeviceAgentService,
    private readonly _profilers: ProfileServices,
    private readonly _streaming: StreamingService,
    private _appiumContext: AppiumContextProxy,
    private readonly _appiumDeviceWebDriverHandler: AppiumDeviceWebDriverHandler,
    private readonly _sharedDevice: AndroidSharedDeviceService,
    private readonly adb: AdbSerial,
    private readonly appiumAdb: AppiumAdb,
    private readonly _reset: AndroidResetService,
    private readonly logger: SerialPrintable,
    readonly browserInstallations: BrowserInstallation[],
  ) {
    this.logger.info(`AndroidChannel created: ${this.serial}`);
  }

  public static async create(param: DeviceChannelOpenParam, streaming: StreamingService, deviceServerService: DeviceServerService, appiumAdb: AppiumAdb): Promise<AndroidChannel> {
    ZombieServiceInstance.deleteAllComponentsIfExist((zombieable: Zombieable): boolean => {
      return zombieable.serial === param.serial && zombieable.platform === Platform.PLATFORM_ANDROID;
    }, 'kill previous zombie');

    const { serial } = param;
    const logger = createAndroidLogger(param.serial);
    const adb = new AdbSerial(serial, logger);
    await adb.unforwardall().catch((error) => {
      deviceServerService.doguLogger.error('Adb.unforwardall failed', { error: errorify(error) });
    });
    const platform = Platform.PLATFORM_ANDROID;

    const systemInfoService = new AndroidSystemInfoService(adb);
    const systemInfo = await systemInfoService.createSystemInfo();
    deviceInfoLogger.info(`AndroidChannel.create`, { serial, systemInfo, modelName: findDeviceModelNameByModelId(systemInfo.system.model) });

    const version = semver.coerce(systemInfo.version);
    if (version && semver.lt(version, '8.0.0')) {
      throw new Error(`Android version must be 8 or higher. current version: ${stringify(version)}`);
    }

    const deviceAgent = new AndroidDeviceAgentService(
      serial,
      systemInfo,
      '127.0.0.1',
      await deviceServerService.devicePortService.createOrGetHostPort(serial, 'AndroidDeviceAgentService'),
      deviceServerService.devicePortService.getAndroidDeviceAgentServerPort(),
      streaming,
      logger,
    );
    await deviceAgent.wait();

    await adb.uninstallApp('io.appium.settings', false).catch((error) => {
      logger.error('adb.uninstallApp.io.appium.settings', { error: errorify(error) });
    });
    const appiumContextProxy = deviceServerService.appiumService.createAndroidAppiumContext(
      serial,
      'builtin',
      await deviceServerService.devicePortService.createOrGetHostPort(serial, 'AndroidAppiumServer'),
    );
    const appiumWaiter = ZombieServiceInstance.addComponent(appiumContextProxy);
    await appiumWaiter.waitUntilAlive();

    const appiumDeviceWebDriverHandler = new AppiumDeviceWebDriverHandler(
      platform,
      serial,
      appiumContextProxy,
      deviceServerService.httpRequestRelayService,
      deviceServerService.appiumEndpointHandlerService,
      deviceServerService.doguLogger,
    );
    const serialUnique = await generateSerialUnique(systemInfo);

    const findAllBrowserInstallationsResult = await deviceServerService.browserManagerService.findAllBrowserInstallations({
      deviceSerial: serial,
      browserPlatform: 'android',
    });
    const appiumContextImpl = await appiumContextProxy.waitUntilBuiltin();
    const reset = new AndroidResetService(serial, logger);
    const sharedDevice = new AndroidSharedDeviceService(serial, appiumAdb, await adb.getProps(), systemInfo, appiumContextImpl, reset, deviceAgent, logger);
    await sharedDevice.setup();
    await sharedDevice.wait();

    const deviceChannel = new AndroidChannel(
      serial,
      serialUnique,
      systemInfo,
      systemInfoService,
      deviceAgent,
      [new AndroidAdbProfileService(appiumContextProxy, adb), new AndroidDisplayProfileService(deviceAgent, adb)],
      streaming,
      appiumContextProxy,
      appiumDeviceWebDriverHandler,
      sharedDevice,
      adb,
      appiumAdb,
      reset,
      logger,
      findAllBrowserInstallationsResult.browserInstallations,
    );

    await streaming.deviceConnected(serial, {
      serial,
      platform: Platform.PLATFORM_ANDROID,
      screenUrl: deviceAgent.screenUrl,
      inputUrl: deviceAgent.inputUrl,
      screenWidth: 0 < systemInfo.graphics.displays.length ? systemInfo.graphics.displays[0].resolutionX : 0,
      screenHeight: 0 < systemInfo.graphics.displays.length ? systemInfo.graphics.displays[0].resolutionY : 0,
    });

    const gamiumContext = deviceServerService.gamiumService.openGamiumContext(deviceChannel);
    deviceChannel.gamiumContext = gamiumContext;

    return deviceChannel;
  }

  async close(): Promise<void> {
    this.logger.info(`AndroidChannel closed: ${this.serial}`);
    await this._gamiumContext?.close().catch((error) => {
      this.logger.error('android gamium context close failed', { error: errorify(error) });
    });
    ZombieServiceInstance.deleteComponent(this._appiumContext);
    this._deviceAgent.delete();
    this._sharedDevice.delete();
    ZombieServiceInstance.deleteAllComponentsIfExist((zombieable: Zombieable): boolean => {
      return zombieable.serial === this.serial && zombieable.platform === Platform.PLATFORM_ANDROID;
    }, 'kill serial bound zombies');
  }

  async queryProfile(methods: ProfileMethod[] | ProfileMethod): Promise<FilledRuntimeInfo> {
    const methodList = Array.isArray(methods) ? methods : [methods];
    const results = await Promise.allSettled(this._profilers.map(async (profiler) => profiler.profile(methodList)));
    const result = results.reduce((acc, result) => {
      if (result.status === 'fulfilled') {
        Object.keys(acc).forEach((key) => {
          const accDesc = Object.getOwnPropertyDescriptor(acc, key);
          const resultDesc = Object.getOwnPropertyDescriptor(result.value, key);
          if (!accDesc || !Array.isArray(accDesc?.value) || accDesc.value.length !== 0 || !resultDesc || !Array.isArray(resultDesc?.value)) {
            return;
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          accDesc.value.push(...resultDesc.value);
        });
        return acc;
      } else {
        this.logger.error('profile failed.', { reason: result.reason });
        return acc;
      }
    }, RuntimeInfo.fromPartial({}));
    return {
      ...result,
      platform: Platform.PLATFORM_ANDROID,
      localTimeStamp: new Date(),
    };
  }

  async startStreamingWebRtcWithTrickle(offer: StreamingOfferDto): Promise<Observable<StreamingAnswer>> {
    const { value } = offer;
    const { $case } = value;
    if ($case !== 'startStreaming') {
      throw new Error('invalid offer');
    }
    const { startStreaming } = value;
    const { option } = startStreaming;
    const screenOption = { ...option.screen } as { [key: string]: unknown };
    const mergedCaptureOption: ScreenCaptureOption = lodash.merge(DefaultScreenCaptureOption(), screenOption as unknown as ScreenCaptureOption);
    this.logger.info('AndroidChannel.startStreamingWebRtcWithTrickle applyOption start ', { mergedCaptureOption });
    await this._deviceAgent.sendWithProtobuf('dcDaApplyStreamingOptionParam', 'dcDaApplyStreamingOptionReturn', { option: { screen: mergedCaptureOption } }, 2 * 1000);

    this.logger.info('AndroidChannel.startStreamingWebRtcWithTrickle applyOption done', { mergedCaptureOption });

    return this._streaming.startStreamingWithTrickle(this.serial, offer);
  }

  async startRecord(option: ScreenRecordOption): Promise<ErrorResult> {
    return Promise.resolve(this._streaming.startRecord(this.serial, option));
  }

  async stopRecord(filePath: string): Promise<ErrorResult> {
    return Promise.resolve(this._streaming.stopRecord(this.serial, filePath));
  }

  async control(control: DeviceControl): Promise<void> {
    await this._deviceAgent.sendWithProtobuf('dcDaControlParam', 'dcDaControlReturn', {
      control: { ...control, position: control.position! },
    });
  }

  async turnScreen(isOn: boolean): Promise<void> {
    if (isOn) await this.adb.turnOnScreen();
    else await this.adb.turnOffScreen();
  }

  async reboot(): Promise<void> {
    await this.adb.reboot();
  }

  async checkHealth(): Promise<DeviceHealthStatus> {
    if (this.isVirtual) {
      const emulatorName = await this.adb.getEmulatorName();
      if (emulatorName !== this.info.system.model) {
        return { isHealthy: false, message: `emulator name is changed. before: ${this.info.system.model}, actual: ${emulatorName}` };
      }
    }
    return { isHealthy: true, message: '' };
  }

  async reset(): Promise<void> {
    const { logger } = this;
    const appiumContextImpl = await checkTime(`AndroidChannel.reset.waitUntilBuiltin`, this._appiumContext.waitUntilBuiltin(), { logger });
    await checkTime(`AndroidChannel.reset.reset`, this._reset.reset(this.info, this.appiumAdb, appiumContextImpl), { logger });
  }

  async killOnPort(port: number): Promise<void> {
    await this.adb.killOnPort(port);
  }

  async forward(hostPort: number, devicePort: number, handler: LogHandler): Promise<void> {
    const { serial } = this;
    const logger = new SerialLogger(serial, new MixedLogger([this.logger, handler]));
    const adb = new AdbSerial(serial, logger);

    await killProcessOnPort(hostPort, logger);
    await adb.forward(hostPort, devicePort);
  }

  async unforward(hostPort: number): Promise<void> {
    await this.adb.unforward(hostPort, { ignore: false });
  }

  async isPortListening(port: number): Promise<boolean> {
    return this.adb.isPortOpen(port);
  }

  getWindows(): DeviceWindowInfo[] {
    return [];
  }

  async subscribeLog(args: string[], handler: LogHandler): Promise<Closable> {
    const { logger } = this;
    const { stdout, stderr } = await this.adb.logcatClear();
    if (stdout) {
      logger.verbose?.(`adb logcat clear stdout: ${stdout}`);
    }
    if (stderr) {
      logger.verbose?.(`adb logcat clear stderr: ${stderr}`);
    }
    const child = this.adb.logcat(args, handler);
    return new AndroidLogClosable(child, logger);
  }

  async uninstallApp(appPath: string, handler: LogHandler): Promise<void> {
    const { serial } = this;
    const logger = new SerialLogger(serial, new MixedLogger([this.logger, handler]));
    const adb = new AdbSerial(serial, logger);

    const stat = await fs.promises.stat(appPath).catch(() => null);
    if (!stat) {
      throw new Error(`app not found: ${appPath}`);
    }
    const manifest = await getManifestFromApp(appPath);
    if (!manifest.package) {
      throw new Error(`Unexpected value. app path: ${appPath}, ${stringify(manifest)}`);
    }
    await adb.uninstallApp(manifest.package, false);
  }

  /**
   * @note if install failed with INSTALL_FAILED_UPDATE_INCOMPATIBLE then uninstall with keep data and install again
   */
  async installApp(appPath: string, handler: LogHandler): Promise<void> {
    const { serial } = this;
    const logger = new SerialLogger(serial, new MixedLogger([this.logger, handler]));
    const adb = new AdbSerial(serial, logger);

    await adb.installAppForce(appPath);
  }

  async runApp(appPath: string, handler: LogHandler): Promise<void> {
    const { serial } = this;
    const logger = new SerialLogger(serial, new MixedLogger([this.logger, handler]));
    const adb = new AdbSerial(serial, logger);

    await adb.turnOnScreen().catch((error) => {
      this.logger.error('adb.runApp.turnOnScreen', { error: errorify(error) });
    });
    const manifest = await getManifestFromApp(appPath);
    if (!manifest.package || !manifest.application?.launcherActivities || manifest.application.launcherActivities.length < 1) {
      throw new Error(`Unexpected value. app path: ${appPath}, ${stringify(manifest)}`);
    }
    const activityName = manifest.application.launcherActivities[0].name;
    if (!activityName) {
      throw new Error(`Unexpected value. app path: ${appPath}, ${stringify(manifest)}`);
    }
    await adb.runApp(manifest.package, activityName);
  }

  /**
   * @note connect to wifi script
   * adb -s $DOGU_DEVICE_SERIAL install $DOGU_ADB_JOIN_WIFI_APK
   * adb -s $DOGU_DEVICE_SERIAL shell am start -n com.steinwurf.adbjoinwifi/.MainActivity -e ssid $DOGU_WIFI_SSID -e password_type WPA -e password $DOGU_WIFI_PASSWORD
   */
  async joinWifi(ssid: string, password: string): Promise<void> {
    await this.adb.joinWifi(ssid, password);
  }

  getAppiumContext(): AppiumContext {
    return this._appiumContext;
  }

  async rentAppiumRemoteContext(reason: string): Promise<AppiumRemoteContextRental> {
    return this._appiumContext.rentRemote(reason);
  }

  async getAppiumCapabilities(): Promise<AppiumCapabilities> {
    return await createAppiumCapabilities(this._appiumContext.options, this.logger);
  }

  set gamiumContext(context: GamiumContext | null) {
    if (this._gamiumContext) {
      throw new Error('Gamium context is already set');
    }
    this._gamiumContext = context;
  }

  get gamiumContext(): GamiumContext | null {
    return this._gamiumContext;
  }

  getWebDriverHandler(): DeviceWebDriverHandler | null {
    return this._appiumDeviceWebDriverHandler;
  }

  async getLocale(): Promise<LocaleCode> {
    const locale = await this.appiumAdb.getDeviceLocale();
    const localeCode = createLocaleCode(locale);
    return localeCode;
  }

  async setLocale(localeCode: LocaleCode): Promise<void> {
    const newAppiumAdb = this.appiumAdb.clone({ adbExecTimeout: 1000 * 60 * 3 });
    await newAppiumAdb.setDeviceLanguageCountry(localeCode.language, localeCode.region, localeCode.script);
  }

  async getGeoLocation(): Promise<GeoLocation> {
    try {
      const location = await this.appiumAdb.getGeoLocation();
      return {
        longitude: typeof location.longitude === 'string' ? parseFloat(location.longitude) : location.longitude,
        latitude: typeof location.latitude === 'string' ? parseFloat(location.latitude) : location.latitude,
        altitude: typeof location.altitude === 'string' ? parseFloat(location.altitude) : location.altitude ?? 0,
        satellites: typeof location.satellites === 'string' ? parseInt(location.satellites, 10) : location.satellites ?? 0,
        speed: typeof location.speed === 'string' ? parseFloat(location.speed) : location.speed ?? 0,
      };
    } catch (e) {
      return await this.adb.getFusedLocation();
    }
  }

  async setGeoLocation(geoLocation: GeoLocation): Promise<void> {
    const newAppiumAdb = this.appiumAdb.clone({ adbExecTimeout: 1000 * 60 * 3 });
    await newAppiumAdb.setGeoLocation(geoLocation);
  }

  async getAlert(): Promise<DeviceAlert | undefined> {
    throw new Error('Method not implemented.');
    await Promise.resolve();
  }

  async getScreenshot(): Promise<string> {
    throw new Error('Method not implemented.');
    await Promise.resolve();
  }
}

async function generateSerialUnique(systemInfo: DeviceSystemInfo): Promise<string> {
  /*
   * @note
   * ## adb devices
   * real-device-a with usb    R3CN203JWKV
   * real-device-a with wifi   adb-R3CN203JWKV-KYVaup._adb-tls-connect._tcp.
   * emulator-a                emulator-5554
   * emulator-b                emulator-5556
   *
   * ## adb shell getprop | grep ro.serialno
   * real-device-a with usb    R3CN203JWKV
   * real-device-a with wifi   R3CN203JWKV
   * emulator-a                EMULATOR32X1X15X0
   * emulator-b                EMULATOR32X1X15X0
   */
  if (!systemInfo.isVirtual) {
    return systemInfo.system.serial; // should use ro.serialno value of "adb getprop". because when connect device with wifi, serial from "adb devices" changes.
  }
  const uuid = await systeminformation.uuid();
  const serialUnique = `${uuid.os}-${systemInfo.system.model}`;

  return serialUnique;
}
