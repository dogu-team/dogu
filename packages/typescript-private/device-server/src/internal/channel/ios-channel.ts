import {
  CodeUtil,
  DeviceSystemInfo,
  ErrorResult,
  FilledRuntimeInfo,
  Platform,
  PrivateProtocol,
  ProfileMethod,
  ProtoRTCPeerDescription,
  RuntimeInfo,
  ScreenRecordOption,
  Serial,
  StreamingAnswer,
} from '@dogu-private/types';
import { Closable, errorify, Printable, PromiseOrValue, stringify } from '@dogu-tech/common';
import { BrowserInstallation, StreamingOfferDto } from '@dogu-tech/device-client-common';
import { killChildProcess } from '@dogu-tech/node';
import { ChildProcess } from 'child_process';
import compressing from 'compressing';
import fs from 'fs';
import path from 'path';
import { Observable } from 'rxjs';
import semver from 'semver';
import { AppiumContext, AppiumContextKey, AppiumContextProxy } from '../../appium/appium.context';
import { AppiumDeviceWebDriverHandler } from '../../device-webdriver/appium.device-webdriver.handler';
import { DeviceWebDriverHandler } from '../../device-webdriver/device-webdriver.common';
import { GamiumContext } from '../../gamium/gamium.context';
import { createIdaLogger } from '../../logger/logger.instance';
import { IdeviceDiagnostics, IdeviceSyslog, MobileDevice } from '../externals';
import { IosDeviceAgentProcess } from '../externals/cli/ios-device-agent';
import { ZombieTunnel } from '../externals/cli/mobiledevice-tunnel';
import { WebdriverAgentProcess } from '../externals/cli/webdriver-agent-process';
import { DeviceChannel, DeviceChannelOpenParam, DeviceServerService, LogHandler } from '../public/device-channel';
import { IosDeviceAgentService } from '../services/device-agent/ios-device-agent-service';
import { IosProfileService } from '../services/profile/ios-profiler';
import { ProfileServices } from '../services/profile/profile-service';
import { StreamingService } from '../services/streaming/streaming-service';
import { IosSystemInfoService } from '../services/system-info/ios-system-info-service';
import { Zombieable } from '../services/zombie/zombie-component';
import { ZombieServiceInstance } from '../services/zombie/zombie-service';
import { DevicePortContext } from '../types/device-port-context';
import { createPortContext } from './util';

type DeviceControl = PrivateProtocol.DeviceControl;

export class IosLogClosable implements Closable {
  constructor(private readonly childProcess: ChildProcess, private readonly printable?: Printable) {}

  close(): void {
    killChildProcess(this.childProcess).catch((error) => {
      this.printable?.error?.('IosLogClosable close failed.', { error: errorify(error) });
    });
  }
}

export class IosChannel implements DeviceChannel {
  private tunnels: ZombieTunnel[] = [];
  private _gamiumContext: GamiumContext | null = null;

  constructor(
    private readonly _serial: Serial,
    private readonly _portContext: DevicePortContext,
    private readonly _info: DeviceSystemInfo,
    private readonly _profilers: ProfileServices,
    private readonly streaming: StreamingService,
    private webdriverAgentProcess: WebdriverAgentProcess,
    private iosDeviceAgentProcess: IosDeviceAgentProcess,
    private readonly deviceAgent: IosDeviceAgentService,
    private _appiumContext: AppiumContextProxy,
    private readonly _appiumDeviceWebDriverHandler: AppiumDeviceWebDriverHandler,
    private readonly logger: Printable,
    readonly browserInstallations: BrowserInstallation[],
  ) {
    this.logger.info(`IosChannel created: ${this.serial}`);
  }

  get serial(): Serial {
    return this._serial;
  }

  get serialUnique(): string {
    return this._serial;
  }

  get platform(): Platform {
    return Platform.PLATFORM_IOS;
  }

  get info(): DeviceSystemInfo {
    return this._info;
  }

  get portContext(): DevicePortContext {
    return this._portContext;
  }

  get isVirtual(): boolean {
    return this._info.isVirtual;
  }

  static async create(param: DeviceChannelOpenParam, streaming: StreamingService, deviceServerService: DeviceServerService): Promise<IosChannel> {
    ZombieServiceInstance.deleteAllComponentsIfExist((zombieable: Zombieable): boolean => {
      return zombieable.serial === param.serial && zombieable.platform === Platform.PLATFORM_IOS;
    }, 'kill previous zombie');

    const { serial, deviceAgentDevicePort, deviceAgentDeviceSecondPort, deviceAgentDeviceThirdPort } = param;
    const platform = Platform.PLATFORM_IOS;

    const productVersion = await IosSystemInfoService.getVersion(serial);
    if (productVersion) {
      const version = semver.coerce(productVersion);
      if (version && semver.lt(version, '14.0.0')) {
        throw new Error(`iOS version must be 14 or higher. current version: ${productVersion}`);
      }
    }

    if (!(await IosDeviceAgentProcess.isReady(serial))) {
      throw new Error(
        `iOSDeviceAgent can't be executed on this device. Please register your device. reference: https://developer.apple.com/help/account/register-devices/register-a-single-device. `,
      );
    }

    let portContext = portContextes.get(serial);
    if (portContext == null) {
      portContext = await createPortContext(serial);
      portContextes.set(serial, portContext);
    }

    const logger = createIdaLogger(param.serial);
    logger.verbose('appium wda starting');
    const wda = await WebdriverAgentProcess.start(serial, portContext.freeHostPort4, logger);
    logger.verbose('appium wda  done');

    logger.verbose('appium context starting');
    const appiumContextProxy = deviceServerService.appiumService.createIosAppiumContext(serial, 'builtin', portContext.freeHostPort3, portContext.freeHostPort4);
    ZombieServiceInstance.addComponent(appiumContextProxy);
    logger.verbose('appium context started');

    logger.verbose('ios device agent process starting');
    const iosDeviceAgentProcess = await IosDeviceAgentProcess.start(
      serial,
      portContext.freeHostPort1,
      deviceAgentDevicePort,
      portContext.freeHostPort2,
      deviceAgentDeviceSecondPort,
      deviceAgentDeviceThirdPort,
      logger,
    ).catch((error) => {
      logger.error('IosDeviceAgentProcess start failed.', { error: errorify(error) });
      throw error;
    });
    logger.verbose('ios device agent process started');

    logger.verbose('ios device agent service starting');
    const deviceAgent = new IosDeviceAgentService(portContext.freeHostPort1, `127.0.0.1:${portContext.freeHostPort2}`, 60, logger);
    await deviceAgent.connect().catch((error) => {
      logger.error('IosDeviceAgentService connect failed.', { error: errorify(error) });
      throw error;
    });
    logger.verbose('ios device agent service started');

    logger.verbose('ios system info service starting');
    const systemInfoService = new IosSystemInfoService(deviceAgent);
    const systemInfo = await systemInfoService.createSystemInfo(serial).catch((error) => {
      logger.error('SystemInfoService createSystemInfo failed.', { error: errorify(error) });
      throw error;
    });
    logger.verbose('ios system info service started');

    logger.verbose('appium device web driver handler service starting');
    const appiumDeviceWebDriverHandler = new AppiumDeviceWebDriverHandler(
      platform,
      serial,
      appiumContextProxy,
      deviceServerService.httpRequestRelayService,
      deviceServerService.appiumEndpointHandlerService,
      deviceServerService.doguLogger,
    );

    const browserInstallations = await deviceServerService.browserManagerService.findAllBrowserInstallations({
      deviceSerial: serial,
      browserPlatform: 'ios',
    });

    const deviceChannel = new IosChannel(
      serial,
      portContext,
      systemInfo,
      [new IosProfileService(deviceAgent)],
      streaming,
      wda,
      iosDeviceAgentProcess,
      deviceAgent,
      appiumContextProxy,
      appiumDeviceWebDriverHandler,
      logger,
      browserInstallations,
    );

    logger.verbose('streaming service calling deviceConnected');
    await Promise.resolve(
      streaming.deviceConnected(serial, {
        serial,
        platform: Platform.PLATFORM_IOS,
        screenUrl: deviceAgent.screenUrl,
        inputUrl: deviceAgent.inputUrl,
        screenWidth: 0 < systemInfo.graphics.displays.length ? systemInfo.graphics.displays[0].resolutionX : 0,
        screenHeight: 0 < systemInfo.graphics.displays.length ? systemInfo.graphics.displays[0].resolutionY : 0,
      }),
    ).catch((error) => {
      logger.error('StreamingService deviceConnected failed.', { error: errorify(error) });
      throw error;
    });
    logger.verbose('streaming service called deviceConnected');

    logger.verbose('gamium context starting');
    const gamiumContext = deviceServerService.gamiumService.openGamiumContext(deviceChannel);
    deviceChannel.gamiumContext = gamiumContext;
    logger.verbose('gamium context started');

    return deviceChannel;
  }

  async close(): Promise<void> {
    this.logger.info(`IosChannel closed: ${this.serial}`);
    this.tunnels.forEach((tunnel) => {
      ZombieServiceInstance.deleteComponent(tunnel, `IosChannel closed: ${this.serial}`);
    });
    await this._gamiumContext?.close().catch((error) => {
      this.logger.error('ios gamium context close failed.', { error: errorify(error) });
    });
    /**
     * @note Does not wait for appium to shutdown
     */
    ZombieServiceInstance.deleteComponent(this._appiumContext);
    this.webdriverAgentProcess.delete();
    this.iosDeviceAgentProcess.delete();
    ZombieServiceInstance.deleteAllComponentsIfExist((zombieable: Zombieable): boolean => {
      return zombieable.serial === this.serial && zombieable.platform === Platform.PLATFORM_IOS;
    }, 'kill serial bound zombies');
  }

  async queryProfile(methods: ProfileMethod[] | ProfileMethod): Promise<FilledRuntimeInfo> {
    const methodList = Array.isArray(methods) ? methods : [methods];
    const results = await Promise.allSettled(this._profilers.map(async (profiler) => profiler.profile(this.serial, methodList)));
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
        this.logger.error('profile failed.', { serial: this.serial, reason: result.reason });
        return acc;
      }
    }, RuntimeInfo.fromPartial({}));
    return {
      ...result,
      platform: Platform.PLATFORM_ANDROID,
      localTimeStamp: new Date(),
    };
  }

  async startStreamingWebRTC(offer: StreamingOfferDto): Promise<ProtoRTCPeerDescription> {
    return Promise.resolve(this.streaming.startStreaming(this.serial, offer));
  }

  async startStreamingWebRtcWithTrickle(offer: StreamingOfferDto): Promise<Observable<StreamingAnswer>> {
    return Promise.resolve(this.streaming.startStreamingWithTrickle(this.serial, offer));
  }

  async startRecord(option: ScreenRecordOption): Promise<ErrorResult> {
    const displays = this._info.graphics.displays;
    const maxResolution = option.screen?.maxResolution ?? 720;

    const screenWidth = 0 < displays.length ? displays[0].resolutionX : 720;
    const screenHeight = 0 < displays.length ? displays[0].resolutionY : 1280;
    this.logger.debug?.(`screenWidth: ${screenWidth}, screenHeight: ${screenHeight}`);

    const longer = Math.max(screenWidth, screenHeight);
    const shorter = Math.min(screenWidth, screenHeight);
    const multiplier = maxResolution / shorter;

    const longerScaled = Math.ceil(longer * multiplier) % 2 === 0 ? Math.ceil(longer * multiplier) : Math.ceil(longer * multiplier) + 1;
    const shorterScaled = maxResolution;
    return Promise.resolve(
      this.streaming.startRecord(this.serial, {
        ...option,
        // etcParam: `-vf scale='w=${longer}:h=${shorter}':'force_original_aspect_ratio=1',pad='${longer}:${shorter}':'(ow-iw)/2':'(oh-ih)/2' -c:v libvpx -copyts`,
        etcParam: `-movflags +faststart -vf scale='w=${longerScaled}:h=${shorterScaled}':'force_original_aspect_ratio=1',pad='${longerScaled}:${shorterScaled}':'(ow-iw)/2':'(oh-ih)/2' -c:v libx264`,
      }),
    );
  }

  async stopRecord(): Promise<ErrorResult> {
    return Promise.resolve(this.streaming.stopRecord(this.serial));
  }

  control(control: DeviceControl): void {
    throw new Error('Method not implemented.');
  }

  turnScreen(isOn: boolean): void {
    throw new Error('Method not implemented.');
  }

  async reboot(): Promise<void> {
    this.logger.verbose?.(`IosChannel.reboot ${this.serial}`);
    await IdeviceDiagnostics.restart(this.serial);
  }

  killOnPort(port: number): void {
    this.logger.warn?.('IosChannel.killOnPort is not implemented yet');
  }

  async forward(hostPort: number, devicePort: number, printable?: Printable): Promise<void> {
    const tunnel = this.tunnels.find((t) => t.devicePort === devicePort);
    if (tunnel) {
      this.logger.warn?.(
        `IosChannel.forward: ${devicePort} is already forwarded, so kill previous forward.(from ${tunnel.hostPort} to ${devicePort}). new forward is ${hostPort} to ${devicePort}`,
      );
      this.unforward(tunnel.hostPort);
    }

    const newTunnel = new ZombieTunnel(this.serial, hostPort, devicePort, this.logger);
    this.tunnels.push(newTunnel);
    await newTunnel.zombieWaiter.waitUntilAlive();
  }

  unforward(hostPort: number): void {
    const tunnel = this.tunnels.find((t) => t.hostPort === hostPort);
    if (tunnel) {
      ZombieServiceInstance.deleteComponent(tunnel, `unforward called: ${this.serial}`);
      this.tunnels = this.tunnels.filter((t) => t.hostPort !== hostPort);
    }
  }

  async isPortListening(port: number): Promise<boolean> {
    const res = await this.deviceAgent.call('dcIdaIsPortListeningParam', 'dcIdaIsPortListeningResult', { port });
    return res.isListening;
  }

  private async findDotAppPath(appPath: string): Promise<string> {
    if (!appPath.endsWith('.ipa')) {
      throw new Error('appPath must be ipa');
    }

    const unzipDesetPath = appPath.substring(0, appPath.length - 4);
    try {
      await fs.promises.access(unzipDesetPath, fs.constants.F_OK);
    } catch {
      await compressing.zip.uncompress(appPath, unzipDesetPath);
    }

    const payloadPath = path.resolve(unzipDesetPath, 'Payload');
    const files = await fs.promises.readdir(payloadPath);
    for (const file of files) {
      if (file.endsWith('.app')) {
        return path.resolve(payloadPath, file);
      }
    }

    throw new Error('not found .app');
  }

  async uninstallApp(appPath: string, printable?: Printable): Promise<void> {
    const dotAppPath = await this.findDotAppPath(appPath);
    const appName = await MobileDevice.getBundleId(dotAppPath);
    await MobileDevice.uninstallApp(this.serial, appName, printable);
  }

  async installApp(appPath: string, printable?: Printable): Promise<void> {
    await MobileDevice.installApp(this.serial, appPath, printable);
  }

  async runApp(appPath: string, printable?: Printable): Promise<void> {
    const installedAppNames = await MobileDevice.listApps(this.serial);
    const dotAppPath = await this.findDotAppPath(appPath);
    const bundleId = await MobileDevice.getBundleId(dotAppPath);
    const result = await this.deviceAgent.runApp({
      appPath,
      installedAppNames,
      bundleId,
    });
    if (CodeUtil.isNotSuccess(result.error?.code)) {
      throw new Error(`runApp failed: ${stringify(result.error)}`);
    }
  }

  subscribeLog(args: string[], handler: LogHandler, printable?: Printable | undefined): PromiseOrValue<Closable> {
    const child = IdeviceSyslog.logcat(this.serial, args, handler, printable);
    return new IosLogClosable(child, printable);
  }

  reset(): PromiseOrValue<void> {
    throw new Error('Method not implemented.');
  }

  joinWifi(ssid: string, password: string): PromiseOrValue<void> {
    throw new Error('Method not implemented.');
  }

  getAppiumContext(): AppiumContext {
    return this._appiumContext;
  }

  async switchAppiumContext(key: AppiumContextKey): Promise<AppiumContext> {
    await this._appiumContext.switchAppiumContext(key);
    return this._appiumContext;
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
}

const portContextes = new Map<Serial, DevicePortContext>();
