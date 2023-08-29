import {
  DefaultDeviceSystemInfo,
  DeviceAgentPort,
  DeviceAgentSecondPort,
  DeviceAgentThirdPort,
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
import { Closable, Printable, PromiseOrValue, stringify } from '@dogu-tech/common';
import { BrowserInstallation, StreamingOfferDto } from '@dogu-tech/device-client-common';
import { ChildProcess, isFreePort } from '@dogu-tech/node';
import { Observable } from 'rxjs';
import systeminformation from 'systeminformation';
import { AppiumContext, AppiumContextKey } from '../../appium/appium.context';
import { DeviceWebDriverHandler } from '../../device-webdriver/device-webdriver.common';
import { SeleniumDeviceWebDriverHandler } from '../../device-webdriver/selenium.device-webdriver.handler';
import { GamiumContext } from '../../gamium/gamium.context';
import { logger } from '../../logger/logger.instance';
import { DeviceChannel, DeviceChannelOpenParam, DeviceServerService, LogHandler } from '../public/device-channel';
import { DeviceAgentService } from '../services/device-agent/device-agent-service';
import { NullDeviceAgentService } from '../services/device-agent/null-device-agent-service';
import { DesktopProfileService } from '../services/profile/desktop-profiler';
import { ProfileService } from '../services/profile/profile-service';
import { StreamingService } from '../services/streaming/streaming-service';
import { DevicePortContext } from '../types/device-port-context';
import { checkTime } from '../util/check-time';
import { parseRecord } from '../util/parse';

type DeviceControl = PrivateProtocol.DeviceControl;

export class WindowsChannel implements DeviceChannel {
  private _gamiumContext: GamiumContext | null = null;

  constructor(
    private readonly _serial: Serial,
    private readonly _info: DeviceSystemInfo,
    private readonly _profile: ProfileService,
    private readonly _streaming: StreamingService,
    private readonly _deviceAgent: DeviceAgentService,
    private readonly _seleniumDeviceWebDriverHandler: SeleniumDeviceWebDriverHandler,
    readonly browserInstallations: BrowserInstallation[],
  ) {}

  get serial(): Serial {
    return this._serial;
  }

  get serialUnique(): string {
    return this._serial;
  }

  get platform(): Platform {
    return Platform.PLATFORM_WINDOWS;
  }

  get info(): DeviceSystemInfo {
    return this._info;
  }

  get portContext(): DevicePortContext {
    return {
      freeHostPort1: DeviceAgentPort,
      freeHostPort2: DeviceAgentSecondPort,
      freeHostPort3: DeviceAgentThirdPort,
    };
  }

  get isVirtual(): boolean {
    return this._info.isVirtual;
  }
  static async create(param: DeviceChannelOpenParam, streaming: StreamingService, deviceServerService: DeviceServerService): Promise<DeviceChannel> {
    const platform = Platform.PLATFORM_WINDOWS;
    const deviceAgent = new NullDeviceAgentService();

    const osInfo = await checkTime('os', systeminformation.osInfo());
    const info: DeviceSystemInfo = {
      ...DefaultDeviceSystemInfo(),
      nickname: osInfo.hostname,
      version: osInfo.release,
      system: await checkTime('system', systeminformation.system()),
      os: { ...osInfo, platform },
      uuid: await checkTime('uuid', systeminformation.uuid()),
      cpu: await checkTime('cpu', systeminformation.cpu()),
    };
    await streaming.deviceConnected(param.serial, {
      serial: param.serial,
      platform,
      screenUrl: deviceAgent.screenUrl,
      inputUrl: deviceAgent.inputUrl,
      screenWidth: 0 < info.graphics.displays.length ? info.graphics.displays[0].resolutionX : 0,
      screenHeight: 0 < info.graphics.displays.length ? info.graphics.displays[0].resolutionY : 0,
    });

    const seleniumDeviceWebDriverHandler = new SeleniumDeviceWebDriverHandler(
      platform,
      param.serial,
      deviceServerService.seleniumService,
      deviceServerService.httpRequestRelayService,
      deviceServerService.seleniumEndpointHandlerService,
      deviceServerService.doguLogger,
    );

    const deviceChannel = new WindowsChannel(param.serial, info, new DesktopProfileService(), streaming, deviceAgent, seleniumDeviceWebDriverHandler, []);

    const gamiumContext = deviceServerService.gamiumService.openGamiumContext(deviceChannel);
    deviceChannel.gamiumContext = gamiumContext;

    return Promise.resolve(deviceChannel);
  }

  async close(): Promise<void> {
    await this._gamiumContext?.close();
  }

  async queryProfile(methods: ProfileMethod[] | ProfileMethod): Promise<FilledRuntimeInfo> {
    const methodList = Array.isArray(methods) ? methods : [methods];
    const result = await this._profile.profile(this.serial, methodList);
    return {
      ...RuntimeInfo.fromPartial(result),
      platform: Platform.PLATFORM_WINDOWS,
      localTimeStamp: new Date(),
    };
  }

  async startStreamingWebRTC(offer: StreamingOfferDto): Promise<ProtoRTCPeerDescription> {
    return Promise.resolve(this._streaming.startStreaming(this.serial, offer));
  }

  async startStreamingWebRtcWithTrickle(offer: StreamingOfferDto): Promise<Observable<StreamingAnswer>> {
    return Promise.resolve(this._streaming.startStreamingWithTrickle(this.serial, offer));
  }

  async startRecord(option: ScreenRecordOption): Promise<ErrorResult> {
    return Promise.resolve(this._streaming.startRecord(this.serial, option));
  }

  async stopRecord(): Promise<ErrorResult> {
    return Promise.resolve(this._streaming.stopRecord(this.serial));
  }

  control(control: DeviceControl): void {
    throw new Error('Method not implemented.');
  }

  async turnScreen(isOn: boolean): Promise<void> {
    return await Promise.resolve(undefined);
  }

  async killOnPort(port: number): Promise<void> {
    const line = await ChildProcess.execIgnoreError(`netstat -ano | findstr :${port} | findstr LISTENING`, {}, logger);
    const splited = parseRecord(line.stdout);
    if (0 === splited.length) {
      logger.warn(`WindowsChannel.killOnPort no port:${port} is listening`);
      return;
    }
    if (splited.length < 4) {
      logger.warn(`WindowsChannel.killOnPort split failed line: ${line.stdout.trim()}`);
      return;
    }
    const pid = splited[splited.length - 1];
    await ChildProcess.exec(`taskkill /F /PID ${pid}`, {}, logger);
  }

  reboot(): void {
    throw new Error('Method not implemented.');
  }

  forward(hostPort: number, devicePort: number, printable?: Printable): void {
    logger.verbose('WindowsChannel.forward not need to implement');
  }

  unforward(hostPort: number): void {
    // noop
  }

  async isPortListening(port: number): Promise<boolean> {
    const isFree = await isFreePort(port);
    return !isFree;
  }

  uninstallApp(appPath: string): void {
    logger.warn('WindowsChannel.uninstallApp is not implemented yet');
  }

  installApp(appPath: string): void {
    logger.warn('WindowsChannel.installApp is not implemented yet');
  }

  runApp(appPath: string): void {
    ChildProcess.spawn(appPath, [], {}, logger).catch((err) => {
      logger.error(`failed to start app`, { error: stringify(err) });
    });
  }

  subscribeLog(args: string[], handler: LogHandler, printable?: Printable | undefined): PromiseOrValue<Closable> {
    throw new Error('Method not implemented.');
  }

  reset(): PromiseOrValue<void> {
    throw new Error('Method not implemented.');
  }

  joinWifi(ssid: string, password: string): void {
    throw new Error('Method not implemented.');
  }

  getAppiumContext(): null {
    return null;
  }

  switchAppiumContext(key: AppiumContextKey): PromiseOrValue<AppiumContext> {
    throw new Error('Method not implemented.');
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
    return this._seleniumDeviceWebDriverHandler;
  }
}
